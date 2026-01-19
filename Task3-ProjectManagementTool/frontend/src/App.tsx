import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Project {
  _id: string;
  projectName: string;
  description: string;
}

interface Task {
  _id: string;
  taskTitle: string;
  status: string;
  projectId: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'dashboard' | 'projects' | 'tasks'>('dashboard');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ projectName: '', description: '', ownerId: '6960f5857a0505c705c7ef7d' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects'),
        axios.get('http://localhost:5000/api/tasks')
      ]);
      setProjects(projRes.data);
      setAllTasks(taskRes.data);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTasks = (projectId: string, name: string) => {
    const matchedTasks = allTasks.filter(t => t.projectId === projectId);
    setFilteredTasks(matchedTasks);
    setSelectedProjectName(name);
    setView('tasks');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/projects', newProject);
      setProjects([...projects, res.data]);
      setShowModal(false);
      setNewProject({ projectName: '', description: '', ownerId: '6960f5857a0505c705c7ef7d' });
    } catch (err) {
      alert("Error creating project!");
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">📁 <span>ProManager</span></div>
        <nav className="nav-menu">
          <div className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>🏠 Dashboard</div>
          <div className={`nav-link ${view === 'projects' ? 'active' : ''}`} onClick={() => setView('projects')}>📂 My Projects</div>
          <div className={`nav-link ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>✅ Task Board</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-bar">
          <h1 className="main-title">
            {view === 'dashboard' ? 'Project Insight' : view === 'projects' ? 'Project Repository' : `Tasks: ${selectedProjectName}`}
          </h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </header>

        {loading ? <div className="loader">Connecting to MongoDB...</div> : (
          <div className="view-container">
            {/* Dashboard Statistics */}
            {view === 'dashboard' && (
              <div className="stats-grid">
                <div className="stat-box"><span>TOTAL PROJECTS</span><h3>{projects.length}</h3></div>
                <div className="stat-box"><span>TASKS COMPLETED</span><h3>12</h3></div>
                <div className="stat-box"><span>TEAM MEMBERS</span><h3>5</h3></div>
              </div>
            )}

            {/* Projects Grid Display */}
            {(view === 'dashboard' || view === 'projects') && (
              <div className="grid-layout">
                {projects.map((p) => (
                  <div key={p._id} className="project-card">
                    <span className="status-tag">ACTIVE</span>
                    <h4>{p.projectName}</h4>
                    <p className="card-desc">{p.description || "Building a collaborative tool for CodeAlpha internship."}</p>
                    <button className="btn-open-tool" onClick={() => handleOpenTasks(p._id, p.projectName)}>Open Tasks</button>
                  </div>
                ))}
              </div>
            )}

            {/* Task Board Section */}
            {view === 'tasks' && (
              <div className="task-view-container">
                {filteredTasks.length > 0 ? (
                  <div className="task-list">
                    {filteredTasks.map(t => (
                      <div key={t._id} className="task-item">
                        <div className="t-info"><strong>{t.taskTitle}</strong><p>Status: {t.status}</p></div>
                        <span className={`badge ${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <img 
                      src="https://cdni.iconscout.com/illustration/premium/thumb/man-complete-checklist-with-tick-marks-illustration-svg-download-png-5605102.png" 
                      alt="No Tasks Found" 
                      className="no-tasks-img" 
                    />
                    <h2 className="empty-title">All Caught Up!</h2>
                    <p className="empty-desc">There are currently no tasks assigned to this project.</p>
                    <button className="btn-back" onClick={() => setView('projects')}>Back to Projects</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Improved Modal Section */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-header">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="modal-form">
                <div className="input-group">
                  <label>Project Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter project name..." 
                    required 
                    value={newProject.projectName} 
                    onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Describe the project goals..." 
                    rows={4} 
                    value={newProject.description} 
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
                <div className="modal-btns">
                  <button type="submit" className="save-btn">Save Project</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;