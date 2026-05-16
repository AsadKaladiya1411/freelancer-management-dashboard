import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, updateProject, deleteProject } from './projectSlice';
import { fetchClients } from '../clients/clientSlice';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = { title: '', client: '', budget: '', deadline: '', status: 'pending', priority: 'medium', description: '' };

const ProjectList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.projects);
  const { items: clients } = useSelector((s) => s.clients);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { dispatch(fetchProjects({ search })); dispatch(fetchClients({ limit: 100 })); }, [dispatch, search]);

  const openAdd = () => { setEditMode(false); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditMode(true); setEditId(p._id);
    setForm({ title: p.title, client: p.client?._id || '', budget: p.budget || '', deadline: p.deadline ? p.deadline.split('T')[0] : '', status: p.status, priority: p.priority || 'medium', description: p.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await dispatch(updateProject({ id: editId, ...form })).unwrap(); toast.success('Project updated'); }
      else { await dispatch(createProject(form)).unwrap(); toast.success('Project created'); }
      setShowModal(false); dispatch(fetchProjects({ search }));
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all payments?')) return;
    try { await dispatch(deleteProject(id)).unwrap(); toast.success('Deleted'); } catch (err) { toast.error(err || 'Failed'); }
  };

  const statusColor = { pending: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  const priorityColor = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600', high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track all your project work</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Add Project</button>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <FiSearch className="text-gray-400 ml-2" />
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">📁</p><p className="font-semibold text-gray-600 dark:text-gray-400">No projects yet</p></div>
      ) : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <th className="table-header">Title</th><th className="table-header">Client</th><th className="table-header">Budget</th>
            <th className="table-header">Deadline</th><th className="table-header">Priority</th><th className="table-header">Status</th><th className="table-header">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-semibold text-gray-800 dark:text-white">{p.title}</td>
                <td className="table-cell">{p.client?.name || '—'}</td>
                <td className="table-cell">{p.budget ? `₹${p.budget.toLocaleString()}` : '—'}</td>
                <td className="table-cell">{p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</td>
                <td className="table-cell"><span className={`badge ${priorityColor[p.priority] || ''}`}>{p.priority}</span></td>
                <td className="table-cell"><span className={`badge ${statusColor[p.status] || ''}`}>{p.status?.replace('_', ' ')}</span></td>
                <td className="table-cell"><div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 transition-colors"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"><FiTrash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editMode ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
              <div><label className="label">Client *</label><select className="input" value={form.client} onChange={(e) => setForm({...form, client: e.target.value})} required>
                <option value="">Select client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
              </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Budget (₹)</label><input type="number" className="input" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} min="0" /></div>
                <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select></div>
                <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select></div>
              </div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editMode ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
