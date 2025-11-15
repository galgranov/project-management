import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './Board.css';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  columnId: string;
  boardId: string;
  order: number;
  owner?: string;
}

interface Column {
  _id: string;
  title: string;
  boardId: string;
  order: number;
  color?: string;
}

interface Board {
  _id: string;
  title: string;
  description?: string;
}

const API_URL = 'http://localhost:3000/api';

export function Board() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchColumns(selectedBoard._id);
      fetchTasks(selectedBoard._id);
    }
  }, [selectedBoard]);

  const fetchBoards = async () => {
    try {
      const response = await fetch(`${API_URL}/boards`);
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchColumns = async (boardId: string) => {
    try {
      const response = await fetch(`${API_URL}/boards/${boardId}/columns`);
      const data = await response.json();
      setColumns(data);
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchTasks = async (boardId: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/board/${boardId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle }),
      });
      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      setNewBoardTitle('');
      setSelectedBoard(newBoard);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    if (!selectedColumn) {
      toast.error('Please select a column');
      return;
    }
    
    if (!selectedBoard) {
      toast.error('Please select a board first');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription.trim() || undefined,
          columnId: selectedColumn,
          boardId: selectedBoard._id,
          owner: newTaskOwner.trim() || undefined,
          priority: newTaskPriority,
        }),
      });
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskOwner('');
      setNewTaskPriority('medium');
      setSelectedColumn('');
      setShowTaskDialog(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedTask) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${draggedTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draggedTask,
          columnId: columnId,
        }),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error moving task:', error);
    } finally {
      setDraggedTask(null);
    }
  };

  return (
    <div className="board-container">
      <header className="header">
        <h1>Project Management Board</h1>
        <div className="board-creator">
          <input
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="New board name..."
            onKeyPress={(e) => e.key === 'Enter' && createBoard()}
          />
          <button onClick={createBoard}>Create Board</button>
        </div>
      </header>

      <div className="board-selector">
        {boards.map((board) => (
          <button
            key={board._id}
            className={`board-tab ${selectedBoard?._id === board._id ? 'active' : ''}`}
            onClick={() => setSelectedBoard(board)}
          >
            {board.title}
          </button>
        ))}
      </div>

      {selectedBoard && (
        <>
          <div className="task-creator">
            <button onClick={() => setShowTaskDialog(true)} className="create-task-btn">
              + Create New Task
            </button>
          </div>

          <div className="columns-container">
            {columns.map((column) => (
              <div 
                key={column._id} 
                className="column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column._id)}
              >
                <h3 className="column-title" style={{ borderColor: column.color }}>
                  {column.title}
                </h3>
                <div className="tasks-list">
                  {tasks
                    .filter((task) => task.columnId === column._id)
                    .map((task) => (
                      <div 
                        key={task._id} 
                        className={`task-card ${draggedTask?._id === task._id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                      >
                        <h4>{task.title}</h4>
                        {task.description && <p>{task.description}</p>}
                        {task.owner && (
                          <div className="task-owner">
                            <span className="owner-badge">👤 {task.owner}</span>
                          </div>
                        )}
                        <div className="task-meta">
                          <span className={`priority priority-${task.priority}`}>
                            {task.priority}
                          </span>
                          <button
                            className="delete-btn"
                            onClick={() => deleteTask(task._id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!selectedBoard && boards.length === 0 && (
        <div className="empty-state">
          <h2>Welcome to Project Management!</h2>
          <p>Create your first board to get started</p>
        </div>
      )}

      {showTaskDialog && (
        <div className="modal-overlay" onClick={() => setShowTaskDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowTaskDialog(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <input
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    placeholder="Owner name..."
                  />
                </div>
                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Column *</label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">Select a column...</option>
                  {columns.map((column) => (
                    <option key={column._id} value={column._id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </button>
              <button className="btn-create" onClick={createTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#172b4d',
            padding: '16px',
            borderRadius: '3px',
            boxShadow: '0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
            fontSize: '14px',
            fontWeight: '400',
            maxWidth: '400px',
          },
          success: {
            style: {
              borderLeft: '4px solid #00875A',
            },
            iconTheme: {
              primary: '#00875A',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #DE350B',
            },
            iconTheme: {
              primary: '#DE350B',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
