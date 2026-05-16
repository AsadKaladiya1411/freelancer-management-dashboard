import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, createClient, updateClient, deleteClient } from './clientSlice';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', company: '', status: 'active', notes: '' };

const ClientList = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((s) => s.clients);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { dispatch(fetchClients({ search })); }, [dispatch, search]);

  const openAdd = () => { setEditMode(false); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditMode(true); setEditId(c._id); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status || 'active', notes: c.notes || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await dispatch(updateClient({ id: editId, ...form })).unwrap(); toast.success('Client updated'); }
      else { await dispatch(createClient(form)).unwrap(); toast.success('Client created'); }
      setShowModal(false); dispatch(fetchClients({ search }));
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client and all related data?')) return;
    try { await dispatch(deleteClient(id)).unwrap(); toast.success('Client deleted'); }
    catch (err) { toast.error(err || 'Failed'); }
  };

  const statusBadge = (s) => {
    const map = { active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    return <span className={`badge ${map[s] || map.active}`}>{s}</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your client relationships</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Add Client</button>
      </div>

      {/* Search */}
      <div className="card p-3 flex items-center gap-3">
        <FiSearch className="text-gray-400 ml-2" />
        <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">📋</p><p className="font-semibold text-gray-600 dark:text-gray-400">No clients found</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="table-header">Name</th><th className="table-header">Company</th><th className="table-header">Email</th>
                <th className="table-header">Phone</th><th className="table-header">Status</th><th className="table-header">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell"><div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {c.name.charAt(0).toUpperCase()}</div>
                      <span className="font-semibold text-gray-800 dark:text-white">{c.name}</span></div></td>
                    <td className="table-cell">{c.company || '—'}</td>
                    <td className="table-cell">{c.email || '—'}</td>
                    <td className="table-cell">{c.phone || '—'}</td>
                    <td className="table-cell">{statusBadge(c.status)}</td>
                    <td className="table-cell"><div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><FiTrash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editMode ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} /></div>
              <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="lead">Lead</option>
              </select></div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
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

export default ClientList;
