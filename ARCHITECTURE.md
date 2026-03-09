# Architecture & Design Notes

## Component Design Philosophy

### Design System (`src/components/ui/`)

All UI components follow these principles:

1. **Simple, Composable Primitives** — UI elements are designed to be basic blocks that slot together easily, avoiding sprawling prop definitions.
2. **Accessible by default** — Form inputs auto-generate `id`/`htmlFor` pairs via `useId()`. Modal uses native `<dialog>` for built-in focus trap. Error messages use `role="alert"`.
3. **Variant + Size pattern** — `Button` and `Tag` use a `variant`/`size` prop pattern with pre-defined style maps, keeping the API clean while supporting multiple visual styles.
4. **ForwardRef** — All form components forward refs for integration with form libraries (Formik uses this).

### Feature Components (`src/features/board/`)

The board follows a **container/presentation** split:

- **`BoardView`** is the container — it owns all state (tasks, filters, modal, DnD) and passes callbacks down.
- **`TaskCardContent`**, **`BoardColumn`**, **`FilterBar`** are presentational — they receive data and callbacks via props. `TaskCard` is a lightweight wrapper that handles the drag-and-drop logic for the card content.
- **`TaskForm`** bridges both — it manages its own form state internally (via Formik) but delegates submit/delete to the parent.

## Storage Versioning Approach

```
┌────────────────────┐    V1 shape           V2 shape
│  localStorage      │    (no tags)          (with tags[])
│  "teamflow_tasks"  │ ──────────────── ──────────────────
│                    │  schemaVersion:1   schemaVersion:2
└────────────────────┘       │                    │
         │                   │                    │
    loadTasksFromStorage()   │                    │
         │                   │                    │
    ┌────▼────┐              │                    │
    │ Parse   │              │                    │
    └────┬────┘              │                    │
         │                   │                    │
    ┌────▼──────────┐        │                    │
    │ Check version │────────┘                    │
    └────┬──────────┘                             │
         │ < CURRENT_SCHEMA_VERSION               │
    ┌────▼────────────┐                           │
    │ runMigrations() │──── migrateV1toV2() ──────┘
    └────┬────────────┘   (adds tags: [])
         │
    ┌────▼──────────┐
    │ Save migrated │
    │ data back     │
    └────┬──────────┘
         │
    ┌────▼──────────────────┐
    │ Show toast:           │
    │ "Data migrated from   │
    │  v1 to latest"        │
    └───────────────────────┘
```

To add a new migration:
1. Increment `CURRENT_SCHEMA_VERSION` in `types/storage.ts`
2. Add a `migrateVNtoVN+1()` function in `utils/storage.ts`
3. Add a condition in `runMigrations()`: `if (data.schemaVersion < N+1) { ... }`

## Dev Notes & Gotchas

### Vitest Globals Issue
Ran into a weird issue where tests failed with "No test suite found". Turned out that using Vitest v4 with `globals: true` conflicted with explicit imports like `import { describe, it } from 'vitest'`. The explicit imports were shadowing the global injections. Fixed it by just removing all explicit vitest imports from the test files and relying purely on the globals.

### Testing Library Matchers
`@testing-library/jest-dom`'s `toBeInTheDocument()` was throwing "Invalid Chai property" errors in Vitest v4. It seems the jest-dom Vitest integration module fails silently if there are module resolution issues under `verbatimModuleSyntax`. I ended up just dropping jest-dom entirely and using native `toBeTruthy()` (since `getByText` throws if it can't find the element anyway) and `toBeNull()`. Much cleaner without the extra dependency.

### Dialog Polyfill for jsdom
Since we're using the native `<dialog>` element for modals, tests were crashing because jsdom doesn't implement `dialog.showModal`. I had to write a quick monkey-patch in `setup.ts` to attach mock `showModal()` and `close()` functions to `<dialog>` elements in the test environment.

## Performance Notes

### Identified: TaskCard re-renders on parent state change
**Issue**: Every `TaskCard` re-renders when any task is moved or edited because `BoardView` re-groups tasks.
**Fix**: `TaskCard` is wrapped in `React.memo()` with the default shallow comparison. Since individual `Task` objects are replaced (not mutated) during updates, memo correctly skips re-renders for unchanged cards.

### Identified: Filter debouncing
**Issue**: The search input in `FilterBar` used to update the URL on every keystroke, causing rapid layout re-renders for fast typists.
**Fix**: Implemented a `useDebounce` hook (with a 300ms delay) so the input field updates smoothly using local state, while the actual filter execution is delayed until the user pauses.

## Next Steps (if given more time)

1. **Within-column drag reorder** — Persist task order within each status column
2. **Dark mode toggle** — Tailwind v4 makes this straightforward with CSS variables
4. **Task comments/activity log** — Add a timeline to each task
5. **Keyboard shortcuts** — `n` for new task, `/` to focus search, `Escape` to close modal
6. **Export/Import** — Allow downloading/uploading tasks as JSON
