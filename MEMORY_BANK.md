# Project Management Application - Memory Bank 🧠

**Last Updated:** November 15, 2025  
**Purpose:** Complete technical reference and context for the Project Management Application

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Backend Services](#backend-services)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Key Patterns & Conventions](#key-patterns--conventions)
8. [Configuration & Setup](#configuration--setup)
9. [Future Enhancements](#future-enhancements)

---

## Project Overview

### Description
A Monday.com-inspired Kanban-style project management application with board, column, and task management capabilities.

### Tech Stack
- **Monorepo:** Nx workspace
- **Backend:** NestJS (TypeScript)
- **Frontend:** React 18 + Vite (TypeScript)
- **Data Storage:** In-memory (arrays) - production-ready structure for easy database migration
- **Package Manager:** npm

### Key Features
- Multi-board management
- Kanban columns with auto-creation (To Do, In Progress, Done)
- Task creation, viewing, and deletion
- Priority levels (Low, Medium, High, Urgent)
- Real-time UI updates
- Modern gradient UI with animations

### Ports
- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:4200`

---

## Architecture

### Project Structure
```
project-management/
├── backend/                      # NestJS Backend
│   └── src/
│       ├── main.ts              # Backend entry point (port 3000)
│       └── app/
│           ├── app.module.ts    # Root module (registers all controllers/services)
│           ├── models/          # TypeScript interfaces & enums
│           │   ├── board.model.ts
│           │   └── task.model.ts
│           ├── services/        # Business logic layer
│           │   ├── boards.service.ts
│           │   └── tasks.service.ts
│           └── controllers/     # HTTP endpoint handlers
│               ├── boards.controller.ts
│               └── tasks.controller.ts
│
├── frontend/                     # React Frontend
│   └── src/
│       ├── main.tsx             # Frontend entry point
│       ├── app/
│       │   ├── app.tsx          # Root component (renders Board)
│       │   └── components/
│       │       ├── Board.tsx    # Main board component (all UI logic)
│       │       └── Board.css    # Styling
│       └── styles.css           # Global styles
│
└── [config files]               # nx.json, package.json, tsconfig, etc.
```

### Design Patterns

#### Backend
- **Layered Architecture:** Controllers → Services → Models
- **Dependency Injection:** NestJS IoC container
- **RESTful API:** Standard HTTP methods and status codes
- **Service Layer Pattern:** Business logic isolated from HTTP layer

#### Frontend
- **Component-Based:** Single Board component manages all UI
- **React Hooks:** useState, useEffect for state management
- **Fetch API:** Standard HTTP client for backend communication
- **Optimistic UI Updates:** Immediate local state updates

---

## Data Models

### Board Interface
```typescript
interface Board {
  id: string;              // UUID
  title: string;           // Board name
  description?: string;    // Optional description
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
  ownerId: string;        // User identifier (default: 'default-user')
}
```

**Storage:** `BoardsService.boards: Board[]`

### Column Interface
```typescript
interface Column {
  id: string;              // UUID
  title: string;           // Column name (e.g., "To Do")
  boardId: string;         // Parent board reference
  order: number;           // Display order (0, 1, 2, ...)
  color?: string;          // Optional color code (default: '#4ECDC4')
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
}
```

**Storage:** `BoardsService.columns: Column[]`

**Default Columns:** Created automatically when a board is created:
1. "To Do" (order: 0)
2. "In Progress" (order: 1)
3. "Done" (order: 2)

### Task Interface
```typescript
interface Task {
  id: string;              // UUID
  title: string;           // Task name
  description?: string;    // Optional description
  status: TaskStatus;      // Enum: TODO | IN_PROGRESS | DONE
  priority: TaskPriority;  // Enum: LOW | MEDIUM | HIGH | URGENT
  assigneeId?: string;     // Optional user assignment
  dueDate?: Date;         // Optional due date
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
  columnId: string;        // Parent column reference
  boardId: string;         // Parent board reference
  order: number;           // Position within column (0, 1, 2, ...)
}
```

**Storage:** `TasksService.tasks: Task[]`

### Enums

#### TaskStatus
```typescript
enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
```

#### TaskPriority
```typescript
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
```

### Relationships
```
Board (1) ──→ (∞) Column
Board (1) ──→ (∞) Task
Column (1) ──→ (∞) Task
```

---

## Backend Services

### BoardsService (`boards.service.ts`)

**Purpose:** Manages boards and columns business logic

**State:**
- `private boards: Board[] = []` - In-memory board storage
- `private columns: Column[] = []` - In-memory column storage

**Key Methods:**

#### Board Operations
```typescript
getAllBoards(): Board[]
getBoardById(id: string): Board | undefined
createBoard(boardData: Partial<Board>): Board
  // Auto-creates 3 default columns
  // Sets default ownerId: 'default-user'
  // Generates UUID and timestamps

updateBoard(id: string, boardData: Partial<Board>): Board | undefined
  // Updates updatedAt timestamp

deleteBoard(id: string): boolean
  // Cascades: deletes associated columns
  // Returns true if successful
```

#### Column Operations
```typescript
getColumnsByBoardId(boardId: string): Column[]
  // Returns sorted by order

createColumn(columnData: Partial<Column>): Column
  // Generates UUID and timestamps
  // Default color: '#4ECDC4'

updateColumn(id: string, columnData: Partial<Column>): Column | undefined
deleteColumn(id: string): boolean
```

**Important Behaviors:**
- Board creation automatically creates 3 default columns
- Deleting a board cascades to delete its columns
- Columns are always returned sorted by order
- UUIDs generated using `crypto.randomUUID()`

### TasksService (`tasks.service.ts`)

**Purpose:** Manages tasks business logic with ordering

**State:**
- `private tasks: Task[] = []` - In-memory task storage

**Key Methods:**

#### CRUD Operations
```typescript
getAllTasks(): Task[]
getTasksByBoardId(boardId: string): Task[]
  // Returns sorted by order

getTasksByColumnId(columnId: string): Task[]
  // Returns sorted by order

getTaskById(id: string): Task | undefined

createTask(taskData: Partial<Task>): Task
  // Auto-calculates next order in column
  // Default status: TaskStatus.TODO
  // Default priority: TaskPriority.MEDIUM

updateTask(id: string, taskData: Partial<Task>): Task | undefined
deleteTask(id: string): boolean
  // Reorders remaining tasks in column
```

#### Special Operations
```typescript
moveTask(id: string, newColumnId: string, newOrder: number): Task | undefined
  // Moves task between columns
  // Reorders tasks in both old and new columns
  // Updates timestamps

private getNextOrder(columnId: string): number
  // Calculates next order number for column

private reorderColumn(columnId: string): void
  // Ensures sequential ordering (0, 1, 2, ...)
  // Called after delete or move operations
```

**Important Behaviors:**
- Tasks maintain order within their column
- Moving or deleting tasks triggers automatic reordering
- Order is 0-indexed and sequential
- Default values: status=TODO, priority=MEDIUM

---

## API Endpoints

### Base URL
`http://localhost:3000/api`

### Boards Endpoints

#### GET `/api/boards`
- **Description:** Get all boards
- **Response:** `Board[]`
- **Status:** 200 OK

#### GET `/api/boards/:id`
- **Description:** Get specific board
- **Response:** `Board`
- **Status:** 200 OK, 404 Not Found

#### POST `/api/boards`
- **Description:** Create new board
- **Request Body:** `Partial<Board>` (title required)
- **Response:** `Board` (with auto-created columns)
- **Status:** 201 Created

#### PUT `/api/boards/:id`
- **Description:** Update board
- **Request Body:** `Partial<Board>`
- **Response:** `Board`
- **Status:** 200 OK, 404 Not Found

#### DELETE `/api/boards/:id`
- **Description:** Delete board and its columns
- **Response:** `{ message: string }`
- **Status:** 200 OK, 404 Not Found

### Columns Endpoints

#### GET `/api/boards/:boardId/columns`
- **Description:** Get all columns for a board (sorted by order)
- **Response:** `Column[]`
- **Status:** 200 OK

#### POST `/api/boards/:boardId/columns`
- **Description:** Create new column
- **Request Body:** `Partial<Column>`
- **Response:** `Column`
- **Status:** 201 Created

#### PUT `/api/boards/columns/:id`
- **Description:** Update column
- **Request Body:** `Partial<Column>`
- **Response:** `Column`
- **Status:** 200 OK, 404 Not Found

#### DELETE `/api/boards/columns/:id`
- **Description:** Delete column
- **Response:** `{ message: string }`
- **Status:** 200 OK, 404 Not Found

### Tasks Endpoints

#### GET `/api/tasks`
- **Description:** Get all tasks
- **Response:** `Task[]`
- **Status:** 200 OK

#### GET `/api/tasks/board/:boardId`
- **Description:** Get all tasks for a board (sorted by order)
- **Response:** `Task[]`
- **Status:** 200 OK

#### GET `/api/tasks/column/:columnId`
- **Description:** Get all tasks in a column (sorted by order)
- **Response:** `Task[]`
- **Status:** 200 OK

#### GET `/api/tasks/:id`
- **Description:** Get specific task
- **Response:** `Task`
- **Status:** 200 OK, 404 Not Found

#### POST `/api/tasks`
- **Description:** Create new task
- **Request Body:** `Partial<Task>` (title, columnId, boardId required)
- **Response:** `Task`
- **Status:** 201 Created

#### PUT `/api/tasks/:id`
- **Description:** Update task
- **Request Body:** `Partial<Task>`
- **Response:** `Task`
- **Status:** 200 OK, 404 Not Found

#### PUT `/api/tasks/:id/move`
- **Description:** Move task to different column
- **Request Body:** `{ columnId: string; order: number }`
- **Response:** `Task`
- **Status:** 200 OK, 404 Not Found

#### DELETE `/api/tasks/:id`
- **Description:** Delete task (auto-reorders column)
- **Response:** `{ message: string }`
- **Status:** 200 OK, 404 Not Found

### Error Handling
- All endpoints throw `HttpException` with appropriate status codes
- 404 for not found resources
- Standard NestJS error response format

---

## Frontend Components

### Board Component (`Board.tsx`)

**Purpose:** Main and only UI component - manages entire application interface

**State Management:**
```typescript
const [boards, setBoards] = useState<Board[]>([]);
const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
const [columns, setColumns] = useState<Column[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [newBoardTitle, setNewBoardTitle] = useState('');
const [newTaskTitle, setNewTaskTitle] = useState('');
const [selectedColumn, setSelectedColumn] = useState('');
```

**Effects:**
```typescript
useEffect(() => {
  fetchBoards();  // Load boards on mount
}, []);

useEffect(() => {
  if (selectedBoard) {
    fetchColumns(selectedBoard.id);  // Load columns when board selected
    fetchTasks(selectedBoard.id);    // Load tasks when board selected
  }
}, [selectedBoard]);
```

**Key Functions:**

#### Data Fetching
```typescript
fetchBoards(): Promise<void>
  // GET /api/boards
  
fetchColumns(boardId: string): Promise<void>
  // GET /api/boards/:boardId/columns
  
fetchTasks(boardId: string): Promise<void>
  // GET /api/tasks/board/:boardId
```

#### User Actions
```typescript
createBoard(): Promise<void>
  // POST /api/boards
  // Auto-selects newly created board
  // Clears input field
  
createTask(): Promise<void>
  // POST /api/tasks
  // Requires: title, columnId, boardId
  // Clears input fields
  
deleteTask(taskId: string): Promise<void>
  // DELETE /api/tasks/:taskId
  // Updates local state immediately
```

**UI Structure:**
```jsx
<div className="board-container">
  <header className="header">
    {/* App title and board creation form */}
  </header>
  
  <div className="board-selector">
    {/* Board tabs */}
  </div>
  
  {selectedBoard && (
    <>
      <div className="task-creator">
        {/* Task creation form */}
      </div>
      
      <div className="columns-container">
        {/* Kanban columns with tasks */}
      </div>
    </>
  )}
  
  {/* Empty state message */}
</div>
```

### Styling (`Board.css`)

**Key Features:**
- Gradient backgrounds and modern animations
- Responsive layout with flexbox
- Card-based design for tasks
- Color-coded priority badges
- Hover effects and transitions
- Smooth animations on interactions

**Color Scheme:**
- Primary gradient: Linear gradient with teal/purple tones
- Priority colors:
  - Low: Green
  - Medium: Yellow
  - High: Orange  
  - Urgent: Red

---

## Key Patterns & Conventions

### Code Organization

#### Backend
1. **Models first:** Define interfaces/enums
2. **Services:** Implement business logic with in-memory storage
3. **Controllers:** Thin HTTP layer, delegate to services
4. **Module registration:** All in `app.module.ts`

#### Frontend
1. **Single component approach:** All logic in Board.tsx
2. **Fetch-then-update:** Optimistic UI updates
3. **Conditional rendering:** Based on state (selectedBoard, empty state)

### Naming Conventions
- **Interfaces:** PascalCase (Board, Task, Column)
- **Enums:** PascalCase with UPPER_CASE values
- **Services:** camelCase with Service suffix
- **Controllers:** camelCase with Controller suffix
- **Methods:** camelCase, descriptive (createTask, deleteBoard)
- **State variables:** camelCase (selectedBoard, newTaskTitle)

### ID Generation
- **Backend:** `crypto.randomUUID()` for all entities
- **Format:** UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")

### Timestamp Management
- **Auto-generated:** createdAt on creation, updatedAt on modification
- **Type:** JavaScript Date object
- **Updated by:** Service layer automatically

### Error Handling
- **Backend:** HttpException with status codes (404, 400, etc.)
- **Frontend:** console.error + graceful failure (no crash)
- **Pattern:** try-catch blocks around all async operations

### Default Values

#### Boards
- `ownerId`: 'default-user'
- Auto-creates 3 columns on creation

#### Columns
- `color`: '#4ECDC4' (teal)
- `order`: Sequential (0, 1, 2, ...)

#### Tasks
- `status`: TaskStatus.TODO
- `priority`: TaskPriority.MEDIUM
- `order`: Auto-calculated as max + 1

---

## Configuration & Setup

### Running the Application

**Prerequisites:**
- Node.js v18+
- npm v8+

**Installation:**
```bash
cd project-management
npm install
```

**Development:**
```bash
# Terminal 1 - Backend
npx nx serve backend
# Runs on http://localhost:3000

# Terminal 2 - Frontend
npx nx serve frontend
# Runs on http://localhost:4200
```

**Build:**
```bash
npx nx build frontend
npx nx build backend
```

**Testing:**
```bash
npx nx test frontend
npx nx test backend
```

**Linting:**
```bash
npx nx lint frontend
npx nx lint backend
```

### Nx Configuration (`nx.json`)

**Key Settings:**
- Workspace layout
- Default project configurations
- Task pipelines
- Cache settings

### Important Files
- `package.json`: Dependencies and scripts
- `tsconfig.base.json`: Shared TypeScript config
- `backend/webpack.config.js`: Backend build config
- `frontend/vite.config.ts`: Frontend build config

---

## Future Enhancements

### Priority: High
- [ ] **Database Integration:** Replace in-memory storage with PostgreSQL/MongoDB
- [ ] **Drag & Drop:** Implement task reordering and column changes
- [ ] **User Authentication:** Add JWT-based auth with Passport
- [ ] **Task Assignment:** Add user management and task assignments

### Priority: Medium
- [ ] **Due Dates:** Add date picker and reminders
- [ ] **Task Details:** Expand task view with descriptions, comments
- [ ] **File Attachments:** Add file upload capability
- [ ] **Search & Filter:** Add task filtering and search functionality
- [ ] **Board Templates:** Pre-configured board layouts

### Priority: Low
- [ ] **Real-time Collaboration:** WebSocket integration
- [ ] **Activity Timeline:** Track changes and history
- [ ] **Email Notifications:** Task reminders and updates
- [ ] **Mobile Responsiveness:** Optimize for mobile devices
- [ ] **Dark Mode:** Theme switcher

### Database Migration Path

**Recommended Stack:** TypeORM + PostgreSQL

**Steps:**
1. Install dependencies: `@nestjs/typeorm typeorm pg`
2. Convert interfaces to TypeORM entities
3. Add decorators (@Entity, @Column, @PrimaryGeneratedColumn)
4. Configure TypeORM in app.module.ts
5. Replace service arrays with repository injection
6. Update methods to use repository API
7. Add migrations for schema management

**Example Entity:**
```typescript
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  title: string;
  
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;
  
  @ManyToOne(() => Column, column => column.tasks)
  column: Column;
  
  // ... more fields
}
```

---

## Technical Debt & Known Issues

### Current Limitations
1. **No Persistence:** Data lost on server restart
2. **No Authentication:** All users share same data
3. **No Validation:** Minimal input validation
4. **No Error Recovery:** Network failures not handled gracefully
5. **Single Component:** Frontend should be split into smaller components
6. **No State Management:** Could benefit from Redux/Zustand for complex state
7. **No Testing:** Missing unit and integration tests

### Node.js Version Warning
- Application works with Node v18 but some packages recommend v20+
- May see peer dependency warnings

### Performance Considerations
- In-memory arrays fine for demo, but scale issues with large datasets
- No pagination on API endpoints
- No query optimization
- All data loaded on mount (could lazy load)

---

## Quick Reference

### Common Tasks

**Add a new API endpoint:**
1. Add method to appropriate service
2. Add controller method with decorator
3. Test with curl/Postman

**Add a new field to Task:**
1. Update Task interface in `task.model.ts`
2. Update TasksService methods to handle field
3. Update frontend Task interface
4. Update UI to display/edit field

**Change default columns:**
1. Modify `BoardsService.createBoard()` method
2. Update column creation calls

### File Locations Quick Reference
- Models: `backend/src/app/models/`
- Services: `backend/src/app/services/`
- Controllers: `backend/src/app/controllers/`
- Frontend Component: `frontend/src/app/components/Board.tsx`
- Styles: `frontend/src/app/components/Board.css`

---

## Contact & Resources

### Documentation
- NestJS: https://docs.nestjs.com
- React: https://react.dev
- Nx: https://nx.dev

### Inspiration
- Monday.com: https://monday.com

---

**Memory Bank Version:** 1.0  
**Last Updated:** November 15, 2025  
**Maintainer:** Project Team
