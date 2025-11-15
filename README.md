# Project Management Application 🚀

A Monday.com-inspired project management application built with **Nx monorepo**, featuring a **React + Vite** frontend and **NestJS** backend.

## 📋 Features

- **Board Management**: Create and manage multiple project boards
- **Kanban Columns**: Default columns (To Do, In Progress, Done) created automatically
- **Task Management**: Create, view, and delete tasks
- **Task Organization**: Organize tasks across different columns
- **Priority Levels**: Low, Medium, High, and Urgent priorities
- **Real-time Updates**: Immediate UI updates after actions
- **Beautiful UI**: Modern gradient design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS** for styling with modern animations

### Backend
- **NestJS** framework
- **TypeScript**
- **In-memory data storage** (easily replaceable with database)
- **UUID** for unique identifiers

### Monorepo
- **Nx** for workspace management
- **npm** for package management

## 🏗️ Project Structure

```
project-management/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── Board.tsx      # Main board component
│   │   │   │   └── Board.css      # Component styles
│   │   │   └── app.tsx            # App entry point
│   │   └── main.tsx
│   └── vite.config.ts
│
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/
│   │   │   │   ├── board.model.ts # Board & Column interfaces
│   │   │   │   └── task.model.ts  # Task interface & enums
│   │   │   ├── services/
│   │   │   │   ├── boards.service.ts
│   │   │   │   └── tasks.service.ts
│   │   │   ├── controllers/
│   │   │   │   ├── boards.controller.ts
│   │   │   │   └── tasks.controller.ts
│   │   │   └── app.module.ts
│   │   └── main.ts
│   └── webpack.config.js
│
├── nx.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v8 or higher)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd project-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Application

You need to run both the backend and frontend in separate terminals.

#### Terminal 1 - Backend:
```bash
npx nx serve backend
```
The backend will start on `http://localhost:3000`

#### Terminal 2 - Frontend:
```bash
npx nx serve frontend
```
The frontend will start on `http://localhost:4200`

### Accessing the Application

Open your browser and navigate to:
```
http://localhost:4200
```

## 📖 API Endpoints

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get all boards |
| GET | `/api/boards/:id` | Get board by ID |
| POST | `/api/boards` | Create a new board |
| PUT | `/api/boards/:id` | Update a board |
| DELETE | `/api/boards/:id` | Delete a board |

### Columns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/columns` | Get columns for a board |
| POST | `/api/boards/:boardId/columns` | Create a column |
| PUT | `/api/boards/columns/:id` | Update a column |
| DELETE | `/api/boards/columns/:id` | Delete a column |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/board/:boardId` | Get tasks by board |
| GET | `/api/tasks/column/:columnId` | Get tasks by column |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| PUT | `/api/tasks/:id/move` | Move task to different column |
| DELETE | `/api/tasks/:id` | Delete a task |

## 💡 Usage Guide

### Creating a Board
1. Enter a board name in the input field at the top
2. Click "Create Board" or press Enter
3. The board is automatically created with 3 default columns

### Adding Tasks
1. Select a board from the tabs
2. Enter a task title
3. Select a column from the dropdown
4. Click "Add Task"

### Managing Tasks
- **View**: Tasks are displayed in their respective columns
- **Delete**: Click the × button on any task card
- **Priority**: Tasks show their priority level with color-coded badges

## 🔧 Development Commands

### Run Tests
```bash
# Frontend tests
npx nx test frontend

# Backend tests
npx nx test backend
```

### Build for Production
```bash
# Build frontend
npx nx build frontend

# Build backend
npx nx build backend
```

### Lint Code
```bash
# Lint frontend
npx nx lint frontend

# Lint backend
npx nx lint backend
```

### Generate Components
```bash
# Generate a React component
npx nx g @nx/react:component my-component --project=frontend

# Generate a NestJS service
npx nx g @nx/nest:service my-service --project=backend
```

## 🎨 Customization

### Adding a Database

The application currently uses in-memory storage. To add a database:

1. Install database package (e.g., TypeORM with PostgreSQL):
   ```bash
   npm install @nestjs/typeorm typeorm pg
   ```

2. Update the models to use TypeORM entities
3. Add TypeORM configuration to `app.module.ts`
4. Update services to use repositories

### Adding Authentication

1. Install Passport and JWT:
   ```bash
   npm install @nestjs/passport @nestjs/jwt passport passport-jwt
   ```

2. Create auth module and guards
3. Protect routes with guards
4. Add user ownership to boards and tasks

### Adding Drag & Drop

1. Install a drag & drop library:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable
   ```

2. Update the Board component to handle drag events
3. Add move/reorder API endpoints

## 🐛 Known Issues

- **Node.js Version**: Some packages require Node.js v20+. The application works with v18 but you may see warnings.
- **Vite Plugin**: Temporarily disabled in nx.json to avoid configuration issues during development.

## 📝 Future Enhancements

- [ ] Add database persistence
- [ ] Implement user authentication
- [ ] Add drag & drop for tasks
- [ ] Add task assignment to users
- [ ] Add due dates and reminders
- [ ] Add task comments and attachments
- [ ] Add board templates
- [ ] Add real-time collaboration with WebSockets
- [ ] Add task filtering and search
- [ ] Add activity timeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Monday.com](https://monday.com)
- Built with [Nx](https://nx.dev)
- Powered by [NestJS](https://nestjs.com) and [React](https://react.dev)

---

**Happy Project Managing! 🎉**
