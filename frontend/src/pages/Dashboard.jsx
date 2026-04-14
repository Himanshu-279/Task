import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import toast from 'react-hot-toast'

const STATUS_COLORS = { 
  pending: '#f59e0b', 
  'in-progress': '#3b82f6', 
  done: '#10b981' 
}

const STATUS_BG = {
  pending: '#fef3c7',
  'in-progress': '#dbeafe',
  done: '#d1fae5'
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' })
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks')
      setTasks(data.tasks)
    } catch { 
      toast.error('Failed to load tasks') 
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Task title cannot be empty')
      return
    }
    try {
      if (editId) {
        await API.put(`/tasks/${editId}`, form)
        toast.success('Task updated! ✨')
        setEditId(null)
      } else {
        await API.post('/tasks', form)
        toast.success('Task created! 🎉')
      }
      setForm({ title: '', description: '', status: 'pending' })
      fetchTasks()
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Error saving task') 
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task permanently?')) return
    try {
      await API.delete(`/tasks/${id}`)
      toast.success('Task deleted! 🗑️')
      fetchTasks()
    } catch { 
      toast.error('Delete failed') 
    }
  }

  const handleEdit = (task) => {
    setEditId(task._id)
    setForm({ title: task.title, description: task.description, status: task.status })
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter)

  const taskStats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerContent}>
          <div>
            <h1 style={s.logo}>Prime<span style={s.logoSpan}>trade</span></h1>
            <p style={s.tagline}>Task Management Dashboard</p>
          </div>
          <div style={s.userProfile}>
            <div style={s.userAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
            <div style={s.userInfo}>
              <p style={s.userName}>{user.name}</p>
              <p style={s.userRole}>{user.role}</p>
            </div>
            <button onClick={logout} style={s.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsContainer}>
        <div style={{...s.statCard, borderLeft: `4px solid ${STATUS_COLORS.pending}`}}>
          <div style={s.statNumber}>{taskStats.pending}</div>
          <div style={s.statLabel}>Pending</div>
        </div>
        <div style={{...s.statCard, borderLeft: `4px solid ${STATUS_COLORS['in-progress']}`}}>
          <div style={s.statNumber}>{taskStats['in-progress']}</div>
          <div style={s.statLabel}>In Progress</div>
        </div>
        <div style={{...s.statCard, borderLeft: `4px solid ${STATUS_COLORS.done}`}}>
          <div style={s.statNumber}>{taskStats.done}</div>
          <div style={s.statLabel}>Completed</div>
        </div>
        <div style={{...s.statCard, borderLeft: `4px solid #8b5cf6`}}>
          <div style={s.statNumber}>{tasks.length}</div>
          <div style={s.statLabel}>Total Tasks</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={s.content}>
        {/* Form Card */}
        <div style={s.formCard}>
          <h3 style={s.sectionTitle}>{editId ? '✏️ Edit Task' : '➕ Create Task'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={s.formGroup}>
              <input 
                placeholder="Task title..."
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                style={s.formInput}
                required
              />
            </div>

            <div style={s.formGroup}>
              <textarea 
                placeholder="Add description (optional)..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                style={{...s.formInput, minHeight: '80px', resize: 'none'}}
              />
            </div>

            <div style={s.formGroup}>
              <select 
                value={form.status} 
                onChange={e => setForm({...form, status: e.target.value})} 
                style={s.formInput}
              >
                <option value="pending">📌 Pending</option>
                <option value="in-progress">⚙️ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={s.btnPrimary}>
                {editId ? '💾 Update' : '➕ Create'}
              </button>
              {editId && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setEditId(null)
                    setForm({title: '', description: '', status: 'pending'})
                  }} 
                  style={s.btnSecondary}
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div style={s.taskSection}>
          <div style={s.taskHeader}>
            <h3 style={s.sectionTitle}>📋 My Tasks</h3>
            <div style={s.filterButtons}>
              {['all', 'pending', 'in-progress', 'done'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    ...s.filterBtn,
                    background: filter === status ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                    color: filter === status ? 'white' : '#333',
                  }}
                >
                  {status === 'all' ? '📊 All' : status === 'pending' ? '📌 Pending' : status === 'in-progress' ? '⚙️ Progress' : '✅ Done'}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyStateText}>No tasks yet. Create one to get started! 🚀</p>
            </div>
          ) : (
            <div style={s.tasksList}>
              {filteredTasks.map(task => (
                <div key={task._id} style={s.taskCard}>
                  <div style={s.taskHeader2}>
                    <div style={{flex: 1}}>
                      <h4 style={s.taskTitle}>{task.title}</h4>
                      {task.description && (
                        <p style={s.taskDesc}>{task.description}</p>
                      )}
                      {user.role === 'admin' && task.owner && (
                        <p style={s.taskOwner}>👤 By: {task.owner.name}</p>
                      )}
                    </div>
                    <span 
                      style={{
                        ...s.statusBadge,
                        background: STATUS_BG[task.status],
                        color: STATUS_COLORS[task.status],
                      }}
                    >
                      {task.status === 'pending' ? '📌' : task.status === 'in-progress' ? '⚙️' : '✅'} {task.status}
                    </span>
                  </div>
                  <div style={s.taskActions}>
                    <button onClick={() => handleEdit(task)} style={s.editBtn}>✏️ Edit</button>
                    <button onClick={() => handleDelete(task._id)} style={s.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingBottom: '40px',
  },
  header: {
    background: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  logoSpan: {
    color: '#764ba2',
  },
  tagline: {
    color: '#999',
    fontSize: '13px',
    margin: '0',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  userInfo: {
    borderRight: '1px solid #e5e7eb',
    paddingRight: '15px',
  },
  userName: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    margin: '0',
    fontSize: '12px',
    color: '#999',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '-30px auto 40px',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 5px 0',
  },
  statLabel: {
    fontSize: '13px',
    color: '#666',
    margin: '0',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '25px',
  },
  formCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    height: 'fit-content',
  },
  sectionTitle: {
    color: '#333',
    marginTop: '0',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    color: '#333',
    background: '#f9fafb',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: 'white',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  taskSection: {},
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  taskHeader2: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  taskCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  taskTitle: {
    color: '#333',
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  taskDesc: {
    color: '#666',
    fontSize: '13px',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  taskOwner: {
    color: '#999',
    fontSize: '12px',
    margin: '0',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  taskActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  editBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#dbeafe',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  deleteBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    background: 'white',
    padding: '60px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
  emptyStateText: {
    color: '#999',
    fontSize: '16px',
    margin: '0',
  },
}
