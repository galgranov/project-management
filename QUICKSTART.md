# Quick Start Guide 🚀

Follow these simple steps to get your project management application running:

## Step 1: Navigate to the Project
```bash
cd project-management
```

## Step 2: Start the Backend (Terminal 1)
```bash
npx nx serve backend
```
✅ Backend will be running at `http://localhost:3000`

## Step 3: Start the Frontend (Terminal 2)
Open a **new terminal** and run:
```bash
npx nx serve frontend
```
✅ Frontend will be running at `http://localhost:4200`

## Step 4: Open in Browser
Navigate to: **http://localhost:4200**

## First Steps in the App

1. **Create a Board**: Enter a name in the top input and click "Create Board"
2. **Add Tasks**: Select your board, enter a task name, choose a column, and click "Add Task"
3. **Manage Tasks**: View tasks in columns, delete tasks with the × button

## Troubleshooting

### Port Already in Use?
If you see "port already in use" errors:

**Backend (3000):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Frontend (4200):**
```bash
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### Cannot Find Module?
Make sure dependencies are installed:
```bash
npm install
```

## Testing the API

You can test the API directly with curl:

```bash
# Create a board
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"title": "My Test Board"}'

# Get all boards
curl http://localhost:3000/api/boards
```

## Need Help?

Check the full [README.md](README.md) for detailed documentation!
