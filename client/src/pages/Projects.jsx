import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { FolderKanban, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS = {
  pending: 'Pending', in_progress: 'In Progress', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', client: '', budget: '', deadline: '', status: 'pending', priority: 'medium' });

  const fetchData = useCallback(async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        api.get('/projects', { params: { search } }),
        api.get('/clients'),
      ]);
      setProjects(projRes.data.projects || []);
      setClients(clientRes.data.clients || []);
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditProject(null);
    setForm({ title: '', client: '', budget: '', deadline: '', status: 'pending', priority: 'medium' });
    setModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      title: p.title,
      client: p.client?._id || '',
      budget: p.budget || '',
      deadline: p.deadline ? p.deadline.split('T')[0] : '',
      status: p.status || 'pending',
      priority: p.priority || 'medium',
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : 0 };
      if (editProject) {
        await api.put(`/projects/${editProject._id}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created');
      }
      setModal(false);
      fetchData();
    } catch { /* interceptor */ }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget._id}`);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchData();
    } catch { /* interceptor */ }
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Projects</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Track and manage your work</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 w-fit"><Plus size={18} /> New Project</button>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <Search size={18} className="text-surface-400 ml-2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="flex-1 bg-transparent outline-none text-surface-900 dark:text-white placeholder-surface-400" />
      </div>

      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description={search ? 'Try a different search' : 'Create your first project'}
          action={!search && <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={18} /> New Project</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  {['Project', 'Client', 'Budget', 'Deadline', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {filtered.map((p) => {
                  const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed';
                  return (
                    <tr key={p._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-surface-900 dark:text-white">{p.title}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{p.client?.name || '—'}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{p.budget ? `₹${p.budget.toLocaleString()}` : '—'}</td>
                      <td className="px-6 py-4">
                        <span className={isOverdue ? 'text-red-500 font-semibold' : 'text-surface-600 dark:text-surface-400'}>
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${STATUS_COLORS[p.status] || 'bg-surface-100 text-surface-600'}`}>
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Client *</label>
            <select value={form.client} onChange={(e) => setForm({...form, client: e.target.value})} className="input-field" required>
              <option value="">Select client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Budget</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editProject ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Project" message={`Delete "${deleteTarget?.title}"? Related payments will also be removed.`}
      />
    </div>
  );
}
