import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { CreditCard, Plus, Search, Pencil, Trash2, DollarSign, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ project: '', client: '', amount: '', paymentDate: '', paymentMethod: 'bank_transfer', notes: '' });

  const fetchData = useCallback(async () => {
    try {
      const [payRes, projRes, clientRes] = await Promise.all([
        api.get('/payments'),
        api.get('/projects'),
        api.get('/clients'),
      ]);
      setPayments(payRes.data.payments || []);
      setTotalAmount(payRes.data.totalAmount || 0);
      setProjects(projRes.data.projects || []);
      setClients(clientRes.data.clients || []);
    } catch { /* interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditPayment(null);
    setForm({ project: '', client: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'bank_transfer', notes: '' });
    setModal(true);
  };

  const openEdit = (p) => {
    setEditPayment(p);
    setForm({
      project: p.project?._id || '',
      client: p.client?._id || '',
      amount: p.amount || '',
      paymentDate: p.paymentDate ? p.paymentDate.split('T')[0] : '',
      paymentMethod: p.paymentMethod || 'bank_transfer',
      notes: p.notes || '',
    });
    setModal(true);
  };

  // Auto-fill client when project is selected
  const handleProjectChange = (projectId) => {
    setForm((prev) => {
      const proj = projects.find((p) => p._id === projectId);
      return { ...prev, project: projectId, client: proj?.client?._id || prev.client };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editPayment) {
        await api.put(`/payments/${editPayment._id}`, payload);
        toast.success('Payment updated');
      } else {
        await api.post('/payments', payload);
        toast.success('Payment recorded');
      }
      setModal(false);
      fetchData();
    } catch { /* interceptor */ }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/payments/${deleteTarget._id}`);
      toast.success('Payment deleted');
      setDeleteTarget(null);
      fetchData();
    } catch { /* interceptor */ }
  };

  const exportCSV = () => {
    const headers = ['Project', 'Client', 'Amount', 'Date', 'Method', 'Notes'];
    const rows = filtered.map((p) => [
      p.project?.title || '', p.client?.name || '', p.amount, p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '', p.paymentMethod || '', p.notes || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const filtered = payments.filter((p) =>
    (p.project?.title && p.project.title.toLowerCase().includes(search.toLowerCase())) ||
    (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase())) ||
    p.amount.toString().includes(search)
  );

  const METHOD_LABELS = { bank_transfer: 'Bank Transfer', upi: 'UPI', cash: 'Cash', paypal: 'PayPal', stripe: 'Stripe', other: 'Other' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Payments</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Track your income and invoices</p>
        </div>
        <div className="flex gap-3">
          {payments.length > 0 && (
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2"><Download size={18} /> Export</button>
          )}
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Payment</button>
        </div>
      </div>

      {/* Total Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-500/25">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20"><DollarSign size={28} /></div>
          <div>
            <p className="text-sm text-white/80">Total Payments</p>
            <p className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <Search size={18} className="text-surface-400 ml-2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="flex-1 bg-transparent outline-none text-surface-900 dark:text-white placeholder-surface-400" />
      </div>

      {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" description={search ? 'Try a different search' : 'Record your first payment'}
          action={!search && <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto"><Plus size={18} /> Add Payment</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  {['Project', 'Client', 'Amount', 'Date', 'Method', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-surface-900 dark:text-white">{p.project?.title || '—'}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{p.client?.name || '—'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-500">₹{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4"><span className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editPayment ? 'Edit Payment' : 'Add Payment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Project *</label>
            <select value={form.project} onChange={(e) => handleProjectChange(e.target.value)} className="input-field" required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}{p.client?.name ? ` (${p.client.name})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Client *</label>
            <select value={form.client} onChange={(e) => setForm({...form, client: e.target.value})} className="input-field" required>
              <option value="">Select client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Amount *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="input-field" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Date *</label>
              <input type="date" value={form.paymentDate} onChange={(e) => setForm({...form, paymentDate: e.target.value})} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Method</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})} className="input-field">
              <option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="cash">Cash</option>
              <option value="paypal">PayPal</option><option value="stripe">Stripe</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="input-field" rows="2" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editPayment ? 'Update' : 'Record'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Payment" message={`Delete this ₹${deleteTarget?.amount?.toLocaleString()} payment?`}
      />
    </div>
  );
}
