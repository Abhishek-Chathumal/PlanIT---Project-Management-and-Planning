import { useState } from 'react';
import './styles/App.css';

function App() {
    const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');

    return (
        <div className="app">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">🚀</span>
                        <h1 className="logo-text">PlanIT.IO</h1>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'board' ? 'active' : ''}`}
                        onClick={() => setCurrentView('board')}
                    >
                        <span className="nav-icon">📋</span>
                        <span>Board</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">U</div>
                        <span className="user-name">User</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <h2 className="page-title">
                        {currentView === 'dashboard' ? 'Dashboard' : 'Project Board'}
                    </h2>
                    <div className="top-bar-actions">
                        <button className="btn btn-primary">+ New Task</button>
                    </div>
                </header>

                <div className="content-area">
                    {currentView === 'dashboard' ? <DashboardView /> : <BoardView />}
                </div>
            </main>
        </div>
    );
}

function DashboardView() {
    return (
        <div className="dashboard">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">12</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">5</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">3</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">2</div>
                    <div className="stat-label">Overdue</div>
                </div>
            </div>

            <div className="welcome-card">
                <h3>Welcome to PlanIT.IO</h3>
                <p>Your project management workspace is ready. Start by creating your first project and adding tasks to your board.</p>
            </div>
        </div>
    );
}

function BoardView() {
    const buckets = [
        { id: '1', title: 'To Do', tasks: ['Design login page', 'Set up database'] },
        { id: '2', title: 'In Progress', tasks: ['Build API gateway', 'Create auth service'] },
        { id: '3', title: 'Done', tasks: ['Project setup', 'Define requirements'] },
    ];

    return (
        <div className="board">
            {buckets.map((bucket) => (
                <div key={bucket.id} className="bucket">
                    <div className="bucket-header">
                        <h3 className="bucket-title">{bucket.title}</h3>
                        <span className="bucket-count">{bucket.tasks.length}</span>
                    </div>
                    <div className="bucket-tasks">
                        {bucket.tasks.map((task, index) => (
                            <div key={index} className="task-card">
                                <p className="task-title">{task}</p>
                            </div>
                        ))}
                    </div>
                    <button className="add-task-btn">+ Add task</button>
                </div>
            ))}
        </div>
    );
}

export default App;
