import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Users, Plus, Search, Pencil, Trash2, Building2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await api.get('/clients', { params: { search } });
      setClients(data.clients || []);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openAdd = () => { setEditClient(null); setForm({ name: '', email: '', phone: '', company: '' }); setModal(true); };
  const openEdit = (c) => { setEditClient(c); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editClient) {
        await api.put(`/clients/${editClient._id}`, form);
        toast.success('Client updated');
      } else {
        await api.post('/clients', form);
        toast.success('Client created');
      }
      setModal(false);
      fetchClients();
    } catch { /* interceptor shows error */ }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      toast.success('Client deleted');
      setDeleteTarget(null);
      fetchClients();
    } catch { /* interceptor */ }
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Clients</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your client relationships</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="card p-3 flex items-center gap-3">
        <Search size={18} className="text-surface-400 ml-2" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..." className="flex-1 bg-transparent outline-none text-surface-900 dark:text-white placeholder-surface-400"
        />
      </div>

      {/* Table */}
      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No clients found" description={search ? 'Try a different search' : 'Add your first client to get started'}
          action={!search && <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={18} /> Add Client</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  {['Client', 'Company', 'Email', 'Phone', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-surface-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{c.company || '—'}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{c.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editClient ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Client name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Company</label>
            <input type="text" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="input-field" placeholder="Company name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field" placeholder="client@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {editClient ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Client" message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all related projects and payments.`}
      />
    </div>
  );
}
