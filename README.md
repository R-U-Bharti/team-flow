# TeamFlow — Workflow Board

A mini Kanban-style team workflow board built with **React 19 + TypeScript + Vite + Tailwind CSS v4** by **Kumar R U Bharti**. Allows creating, editing, filtering, sorting, and dragging tasks across Backlog / In Progress / Done columns — all persisted in `localStorage` with versioned schema migrations.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Architecture Overview

### Project Structure

```
src/
├── __tests__/          # Vitest integration tests
├── components/ui/      # Reusable design-system components
│   ├── Button.tsx      # Primary/secondary/destructive/ghost variants
│   ├── TextInput.tsx   # Labeled input with error states
│   ├── TextArea.tsx    # Multi-line text input
│   ├── Select.tsx      # Styled native select
│   ├── Tag.tsx         # Color-coded badges (priority, tags)
│   ├── Card.tsx        # Generic stylized container
│   ├── Modal.tsx       # <dialog>-based modal with focus trap
│   ├── Toast.tsx       # Ephemeral notification system
│   ├── ConfirmDialog.tsx # Custom confirmation dialog UI
│   └── ConfirmProvider.tsx # Context provider for useConfirm
├── features/board/     # Board feature components
│   ├── BoardView.tsx   # Main orchestrator (DnD, filters, CRUD)
│   ├── BoardColumn.tsx # Single Kanban column (droppable)
│   ├── TaskCard.tsx    # Draggable task wrapper
│   ├── TaskCardContent.tsx # Visual content for tasks (and drag overlay)
│   ├── TaskForm.tsx    # Create/Edit form (Formik + Yup)
│   ├── FilterBar.tsx   # Search, status, priority, sort controls
│   └── EmptyState.tsx  # No-tasks / no-results / error states
├── hooks/              # Custom React hooks
│   ├── useTaskStore.ts # Task CRUD + localStorage persistence
│   ├── useTaskFilters.ts  # URL query-string synced filters
│   ├── useUnsavedChanges.ts  # Dirty-state warning
│   └── useDebounce.ts  # Hook to delay rapid filter updates
├── types/              # TypeScript type definitions
│   ├── task.ts         # Task, TaskStatus, TaskPriority
│   ├── filters.ts      # Filter/sort types
│   └── storage.ts      # Schema versioning + migration types
├── utils/              # Pure utility functions
│   ├── storage.ts      # localStorage read/write + migrations
│   └── taskHelpers.ts  # create, filter, sort, group helpers
├── App.tsx             # App shell with header
└── main.tsx            # Entry point (Router + Toast providers)
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Redux + Redux-persist for tasks** | Centralized state management using Redux Toolkit. `redux-persist` handles automatic persistence to `localStorage` with built-in versioning and encryption (via `redux-persist-transform-encrypt`). |
| **URL query-string for filters** | Filters are represented in the URL (e.g. `?q=auth&priority=high&sort=updatedAt`), making them bookmarkable and shareable. Uses React Router's `useSearchParams`. |
| **Native `<dialog>` for Modal** | Provides built-in accessibility (focus trap, Escape key, `aria-modal`) without needing a third-party library. Polyfilled in tests since jsdom lacks `showModal()`. |
| **Formik + Yup** | Already in the project. Gives declarative validation, dirty-state tracking, and field-level error messages out of the box. |
| **@dnd-kit for drag-and-drop** | Lightweight, accessible, and works well with sorted lists. Supports keyboard navigation for DnD. |
| **Toast via React Context** | Simple context-based toast system avoids adding Redux complexity for ephemeral UI state. |
| **Custom Confirmation System** | Replaced all native browser `confirm()` dialogs with a custom `ConfirmDialog` and `useConfirm` hook for UI consistency. |
| **Tailwind CSS v4** | Already configured in the project. All component styles are co-located using utility classes. |

### Storage & Persistence

Tasks are managed in the Redux store and persisted by `redux-persist`.

- **Encryption**: Data in `localStorage` is encrypted to protect user information.
- **Versioning**: Schema versioning is handled by `redux-persist`'s `version` and `migrate` features.
- **State Flow**: Components interact with `useTaskStore` (custom hook wrapping Redux) to trigger updates.

### Component Hierarchy

```
App
├── Header (branding)
└── BoardView (main orchestrator)
    ├── FilterBar
    │   ├── TextInput (search)
    │   ├── Status toggle buttons
    │   ├── Select (priority)
    │   └── Select (sort + order)
    ├── BoardColumn × 3 (Backlog | In Progress | Done)
    │   └── TaskCard × N (draggable wrapper)
    │       └── TaskCardContent (visuals)
    │           ├── Tag (priority badge)
    │           ├── Tag × N (task tags)
    │           └── Assignee avatar
    ├── TaskForm (inside Modal)
    │   ├── TextInput (title)
    │   ├── TextArea (description)
    │   ├── Select × 2 (status, priority)
    │   ├── TextInput (assignee)
    │   └── Tag input (tags)
    └── EmptyState (conditional)
```

## Testing

```bash
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

Tests use **Vitest** + **React Testing Library**. The test suite covers:

1. **Empty state** — board shows "No tasks yet" when storage is empty
2. **Task creation workflow** — create a task → appears on the board → persisted in localStorage
3. **Form validation** — submit without title → shows "Title is required" error
4. **Priority filtering** — seed tasks → filter by High → only High tasks visible
5. **No-results state** — search for nonexistent text → shows "No tasks found"
6. **Schema migration** — load V1 data → migrated to V2 → toast notification shown

## Known Limitations & Trade-offs

- **No backend** — Data lives only in the browser's localStorage. Clearing browser data loses all tasks.
- **Drag-and-drop** moves tasks between columns (status change only); reordering within a column is not persisted.
- **Single-user** — No auth, no collaboration. Designed as a single-user local tool.
- **No undo** — Deleted tasks cannot be recovered.
- **jsdom limitation** — The native `<dialog>` element's `showModal()` must be polyfilled in tests.