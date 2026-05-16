import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, createPayment, updatePayment, deletePayment } from './paymentSlice';
import { fetchProjects } from '../projects/projectSlice';
import { fetchClients } from '../clients/clientSlice';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = { project: '', client: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'bank_transfer', notes: '' };

const PaymentList = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, loading } = useSelector((s) => s.payments);
  const { items: projects } = useSelector((s) => s.projects);
  const { items: clients } = useSelector((s) => s.clients);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchPayments({}));
    dispatch(fetchProjects({ limit: 100 }));
    dispatch(fetchClients({ limit: 100 }));
  }, [dispatch]);

  const openAdd = () => { setEditMode(false); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditMode(true); setEditId(p._id);
    setForm({ project: p.project?._id || '', client: p.client?._id || '', amount: p.amount || '', paymentDate: p.paymentDate ? p.paymentDate.split('T')[0] : '', paymentMethod: p.paymentMethod || 'bank_transfer', notes: p.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await dispatch(updatePayment({ id: editId, ...form })).unwrap(); toast.success('Payment updated'); }
      else { await dispatch(createPayment(form)).unwrap(); toast.success('Payment recorded'); }
      setShowModal(false); dispatch(fetchPayments({}));
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try { await dispatch(deletePayment(id)).unwrap(); toast.success('Deleted'); dispatch(fetchPayments({})); }
    catch (err) { toast.error(err || 'Failed'); }
  };

  // Auto-select client when project is selected
  const handleProjectChange = (projectId) => {
    const proj = projects.find(p => p._id === projectId);
    setForm({ ...form, project: projectId, client: proj?.client?._id || form.client });
  };

  const filtered = items.filter(p =>
    (p.project?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.amount).includes(search)
  );

  const methodLabel = { bank_transfer: 'Bank Transfer', upi: 'UPI', cash: 'Cash', paypal: 'PayPal', stripe: 'Stripe', other: 'Other' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track income & payments</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Add Payment</button>
      </div>

      {/* Total Card */}
      <div className="stat-card bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><FiDollarSign className="text-2xl" /></div>
          <div><p className="text-sm opacity-80">Total Earnings</p><p className="text-3xl font-extrabold">₹{(totalAmount || 0).toLocaleString()}</p></div>
        </div>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <FiSearch className="text-gray-400 ml-2" />
        <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">💰</p><p className="font-semibold text-gray-600 dark:text-gray-400">No payments found</p></div>
      ) : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <th className="table-header">Project</th><th className="table-header">Client</th><th className="table-header">Amount</th>
            <th className="table-header">Date</th><th className="table-header">Method</th><th className="table-header">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-semibold text-gray-800 dark:text-white">{p.project?.title || '—'}</td>
                <td className="table-cell">{p.client?.name || '—'}</td>
                <td className="table-cell"><span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{p.amount?.toLocaleString()}</span></td>
                <td className="table-cell">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                <td className="table-cell"><span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{methodLabel[p.paymentMethod] || p.paymentMethod}</span></td>
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
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editMode ? 'Edit Payment' : 'New Payment'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Project *</label><select className="input" value={form.project} onChange={(e) => handleProjectChange(e.target.value)} required>
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title} {p.client?.name ? `(${p.client.name})` : ''}</option>)}
              </select></div>
              <div><label className="label">Client *</label><select className="input" value={form.client} onChange={(e) => setForm({...form, client: e.target.value})} required>
                <option value="">Select client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} min="0" step="0.01" required /></div>
                <div><label className="label">Date *</label><input type="date" className="input" value={form.paymentDate} onChange={(e) => setForm({...form, paymentDate: e.target.value})} required /></div>
              </div>
              <div><label className="label">Payment Method</label><select className="input" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>
                <option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="cash">Cash</option>
                <option value="paypal">PayPal</option><option value="stripe">Stripe</option><option value="other">Other</option>
              </select></div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editMode ? 'Update' : 'Record Payment'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
