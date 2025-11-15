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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = 'http://localhost:3000/api';

export function Board() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('member');
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
  const [activeMenu, setActiveMenu] = useState('boards');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isBoardListExpanded, setIsBoardListExpanded] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskOwner, setEditTaskOwner] = useState('');
  const [editOwnerSearchQuery, setEditOwnerSearchQuery] = useState('');
  const [showEditOwnerDropdown, setShowEditOwnerDropdown] = useState(false);

  useEffect(() => {
    fetchBoards();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Ensure users is always an array
    }
  };

  const createUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
        }),
      });
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('member');
      toast.success('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleUserSelect = (userName: string) => {
    setNewTaskOwner(userName);
    setUserSearchQuery(userName);
    setShowUserDropdown(false);
  };

  const handleUserSearchChange = (value: string) => {
    setUserSearchQuery(value);
    setNewTaskOwner(value);
    setShowUserDropdown(value.length > 0);
  };

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
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskClick = (task: Task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || '');
    setEditTaskOwner(task.owner || '');
    setEditOwnerSearchQuery(task.owner || '');
  };

  const filteredEditUsers = users.filter(user =>
    user.name.toLowerCase().includes(editOwnerSearchQuery.toLowerCase())
  );

  const handleEditOwnerSelect = (userName: string) => {
    setEditTaskOwner(userName);
    setEditOwnerSearchQuery(userName);
    setShowEditOwnerDropdown(false);
  };

  const handleEditOwnerSearchChange = (value: string) => {
    setEditOwnerSearchQuery(value);
    setEditTaskOwner(value);
    setShowEditOwnerDropdown(value.length > 0);
  };

  const updateTask = async (taskId: string) => {
    if (!editTaskTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          title: editTaskTitle,
          description: editTaskDescription.trim() || undefined,
          owner: editTaskOwner.trim() || undefined,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
        setEditingTaskId(null);
        setEditTaskTitle('');
        setEditTaskDescription('');
        setEditTaskOwner('');
        setEditOwnerSearchQuery('');
        toast.success('Task updated successfully!');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
    setEditTaskOwner('');
    setEditOwnerSearchQuery('');
    setShowEditOwnerDropdown(false);
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
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🍃 Atlas PM</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Users</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'boards' ? 'active' : ''}`}
            onClick={() => setActiveMenu('boards')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Boards</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>

        {/* Boards List in Sidebar */}
        {activeMenu === 'boards' && (
          <div className="sidebar-content">
            <div className="sidebar-section">
              <button 
                className="section-header-toggle"
                onClick={() => setIsBoardListExpanded(!isBoardListExpanded)}
              >
                <span className="toggle-icon">{isBoardListExpanded ? '▼' : '▶'}</span>
                <h3>Your Boards</h3>
                <span className="board-count">{boards.length}</span>
              </button>
              
              {isBoardListExpanded && (
                <>
                  <div className="board-list">
                    {boards.map((board) => (
                      <button
                        key={board._id}
                        className={`board-item ${selectedBoard?._id === board._id ? 'active' : ''}`}
                        onClick={() => setSelectedBoard(board)}
                      >
                        <span className="board-icon">📊</span>
                        <span className="board-name">{board.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="board-creator-sidebar">
                    <input
                      type="text"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      placeholder="New board name..."
                      onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                    />
                    <button onClick={createBoard} className="btn-add-board">+</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>{selectedBoard ? selectedBoard.title : 'Project Management'}</h1>
        </header>

        {activeMenu === 'users' && (
          <div className="content-section">
            <div className="users-header">
              <h2>Team Members</h2>
              <p>Manage your team members and their roles</p>
            </div>

            <div className="user-form-card">
              <h3>Add New User</h3>
              <div className="user-form">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full name"
                />
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email address"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={createUser} className="btn-add-user">
                  Add User
                </button>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                            <span className="user-name">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button
                            className="btn-delete-user"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-users">
                <p>No users yet. Add your first team member above.</p>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'settings' && (
          <div className="content-section">
            <div className="empty-state">
              <h2>⚙️ Settings</h2>
              <p>Settings page coming soon</p>
            </div>
          </div>
        )}

        {activeMenu === 'boards' && selectedBoard && (
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
                        className={`task-card ${draggedTask?._id === task._id ? 'dragging' : ''} ${editingTaskId === task._id ? 'editing' : ''}`}
                        draggable={editingTaskId !== task._id}
                        onDragStart={() => handleDragStart(task)}
                      >
                        {editingTaskId === task._id ? (
                          <div className="task-edit-mode">
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              className="edit-task-title"
                              placeholder="Task title..."
                              autoFocus
                            />
                            <textarea
                              value={editTaskDescription}
                              onChange={(e) => setEditTaskDescription(e.target.value)}
                              className="edit-task-description"
                              placeholder="Description..."
                              rows={2}
                            />
                            <div className="edit-owner-wrapper">
                              <label className="edit-owner-label">Assign To</label>
                              <div className="autocomplete-wrapper">
                                <input
                                  type="text"
                                  value={editOwnerSearchQuery}
                                  onChange={(e) => handleEditOwnerSearchChange(e.target.value)}
                                  onFocus={() => setShowEditOwnerDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowEditOwnerDropdown(false), 200)}
                                  placeholder="Search user..."
                                  className="edit-owner-input"
                                />
                                {showEditOwnerDropdown && filteredEditUsers.length > 0 && (
                                  <div className="autocomplete-dropdown">
                                    {filteredEditUsers.map((user) => (
                                      <div
                                        key={user._id}
                                        className="autocomplete-item"
                                        onClick={() => handleEditOwnerSelect(user.name)}
                                      >
                                        <span className="autocomplete-avatar">{user.name.charAt(0).toUpperCase()}</span>
                                        <div className="autocomplete-info">
                                          <span className="autocomplete-name">{user.name}</span>
                                          <span className="autocomplete-role">{user.role}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="edit-task-actions">
                              <button 
                                className="btn-save-task"
                                onClick={() => updateTask(task._id)}
                              >
                                Save
                              </button>
                              <button 
                                className="btn-cancel-task"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => handleTaskClick(task)}>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task._id);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
        )}

        {activeMenu === 'boards' && !selectedBoard && boards.length === 0 && (
          <div className="content-section">
            <div className="empty-state">
              <h2>Welcome to Project Management!</h2>
              <p>Create your first board to get started</p>
            </div>
          </div>
        )}
      </main>

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
                <div className="form-group autocomplete-wrapper">
                  <label>Assign To</label>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    onFocus={() => setShowUserDropdown(true)}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    placeholder="Search user..."
                  />
                  {showUserDropdown && filteredUsers.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          className="autocomplete-item"
                          onClick={() => handleUserSelect(user.name)}
                        >
                          <span className="autocomplete-avatar">{user.name.charAt(0).toUpperCase()}</span>
                          <div className="autocomplete-info">
                            <span className="autocomplete-name">{user.name}</span>
                            <span className="autocomplete-role">{user.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
