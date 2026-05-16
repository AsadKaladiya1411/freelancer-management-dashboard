import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await API.get('/payments', { params }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createPayment = createAsyncThunk('payments/create', async (d, { rejectWithValue }) => {
  try { const { data } = await API.post('/payments', d); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updatePayment = createAsyncThunk('payments/update', async ({ id, ...d }, { rejectWithValue }) => {
  try { const { data } = await API.put(`/payments/${id}`, d); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deletePayment = createAsyncThunk('payments/delete', async (id, { rejectWithValue }) => {
  try { await API.delete(`/payments/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { items: [], totalAmount: 0, pagination: null, loading: false, error: null },
  reducers: { clearPaymentError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (s) => { s.loading = true; })
      .addCase(fetchPayments.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload.payments; s.totalAmount = a.payload.totalAmount; s.pagination = a.payload.pagination;
      })
      .addCase(fetchPayments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createPayment.fulfilled, (s, a) => { s.items.unshift(a.payload.payment); })
      .addCase(updatePayment.fulfilled, (s, a) => {
        const i = s.items.findIndex(p => p._id === a.payload.payment._id);
        if (i !== -1) s.items[i] = a.payload.payment;
      })
      .addCase(deletePayment.fulfilled, (s, a) => { s.items = s.items.filter(p => p._id !== a.payload); });
  },
});
export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
