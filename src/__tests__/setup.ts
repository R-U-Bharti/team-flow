/**
 * Test setup — configure testing environment.
 *
 * Polyfills dialog.showModal / dialog.close for jsdom
 * which doesn't support the native <dialog> element API.
 */

// Polyfill HTMLDialogElement methods for jsdom
const origCreateElement = document.createElement.bind(document);
document.createElement = function (
  tagName: string,
  options?: ElementCreationOptions,
) {
  const el = origCreateElement(tagName, options);
  if (tagName.toLowerCase() === "dialog" && !(el as any).showModal) {
    (el as any).showModal = function () {
      this.setAttribute("open", "");
    };
    (el as any).close = function () {
      this.removeAttribute("open");
    };
  }
  return el;
} as typeof document.createElement;
