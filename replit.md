# CodeCollab Workspace

## Overview

pnpm workspace monorepo using TypeScript. A collaborative real-time code editor platform — VS Code meets Discord.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.io (real-time WebSockets)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Monaco Editor, Zustand, Wouter

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express + Socket.io server
│   └── codecollab/         # React + Vite frontend app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### CodeCollab App (artifacts/codecollab)

- **Home Page**: Friend list with online/offline status, list of all rooms, create room button
- **Room/Editor Page**: Full collaborative code editor with VS Code-style layout
- **Real-time collaboration** via Socket.io WebSockets
- **Monaco Editor** with syntax highlighting for multiple languages
- **File/folder explorer** with create/delete operations
- **Terminal panel** with output display
- **Light/Dark mode** toggle with localStorage persistence
- **Language switcher**: JavaScript, TypeScript, Python, Go, Rust, C++, Java, HTML, CSS, JSON
- **Typing indicators**: Shows pulsing "typing..." badge when collaborators are editing
- **Room system**: Create and join rooms like Discord

### API Server (artifacts/api-server)

Express 5 + Socket.io server. Routes at `/api`. WebSocket at `/api/socket.io`.

#### REST Routes
- `GET/POST /api/users` — user management
- `GET/PUT /api/users/:id/status` — status updates
- `GET/POST /api/rooms` — room management
- `GET /api/rooms/:id` — get room with members
- `GET/POST /api/rooms/:id/files` — file management
- `GET/PUT/DELETE /api/rooms/:id/files/:fileId` — file CRUD

#### Socket.io Events
- `join-room`, `leave-room` — presence management
- `code-change` — broadcast code edits
- `cursor-move` — share cursor positions
- `user-typing`, `user-stopped-typing` — typing indicators
- `file-created`, `file-deleted`, `file-selected` — file tree sync
- `language-change` — language sync
- `terminal-output` — terminal output broadcast

## Database Schema

- **users**: id, username, avatar, status (online/offline/away), currentRoomId
- **rooms**: id, name, description, language
- **room_members**: roomId, userId, joinedAt (join table)
- **files**: id, roomId, name, path, type (file/folder), content, language, parentId

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` with `composite: true`. Root `tsconfig.json` lists all lib packages as project references.

- `pnpm run typecheck:libs` — builds composite libs with `tsc --build`
- `pnpm run typecheck` — full check: libs + leaf packages

## Packages

### Frontend (artifacts/codecollab)
- `@monaco-editor/react` — VS Code-like code editor
- `socket.io-client` — real-time WebSocket client
- `react-resizable-panels` — resizable VS Code-like panels
- `zustand` — state management
- `framer-motion` — animations
- `lucide-react` — icons
- `wouter` — routing

### Backend (artifacts/api-server)
- `socket.io` — real-time WebSocket server
- `express` v5 — HTTP server
- `@workspace/db` — database layer

## Running

- API Server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/codecollab run dev`
- DB schema push: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
