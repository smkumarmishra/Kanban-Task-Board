# Kanban-Task-Board
Basically It is clone of JIRA . A modern Kanban-style issue tracking application inspired by tools like Jira and Trello. This project focuses on task management, smooth drag-and-drop interactions, state handling, and clean frontend architecture.

# Kanban Task Board (Jira-like)

A modern Kanban-style task board inspired by Jira/Trello. It supports creating tasks, editing, deleting, drag-and-drop between columns, filtering, undo/reset, and local persistence.

## Features

- 3 columns: **Todo**, **In Progress**, **Done**
- Create / edit / delete tasks (title, priority, assignee, optional description)
- Drag & drop tasks between columns (and reorder inside a column)
- Filters
  - Priority dropdown
  - Assignee dropdown
  - Search box: filters by **assignee OR priority** (fast client-side filtering)
- Undo last action
- Reset board
- Persists board state in `localStorage` (so refresh keeps your data)

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit (state management)
- `@dnd-kit` (drag and drop)

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Deploy (GitHub Pages)

This repo includes a deploy script:

```bash
npm run deploy
```

Important:

- `vite.config.ts` sets `base: '/Kanban-Task-Board/'`. If your GitHub repo name is different, update it.

## Project Structure

```text
src/
  components/
    KanbanBoard.tsx     # board + drag/drop + filtering
    KanbanColumn.tsx    # renders one column
    TaskCard.tsx        # task UI card
    TaskModal.tsx       # create/edit modal form
    FiltersBar.tsx      # priority/assignee filters + search + undo/reset buttons
  store/
    kanbanSlice.ts      # tasks/columns/filters + undo + persistence key
    index.ts            # redux store config
  util/
    reduxHooks.ts       # typed redux hooks
  App.tsx
  main.tsx
```

## Data & Persistence Notes

- Board state is stored in `localStorage` under the key `kanban_board_v1`.
- The stored data includes `columns`, `tasks`, and `filters`.
- Undo is implemented as a single snapshot of the previous state.

## Notes / Known Warnings

- During Vite build you may see a warning about Node's `os` module from `uniqid`. The app still builds and runs, but if you want a cleaner browser-only setup you can replace `uniqid` with `nanoid` or `crypto.randomUUID()`.
