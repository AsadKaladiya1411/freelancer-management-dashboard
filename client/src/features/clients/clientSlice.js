import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchClients = createAsyncThunk('clients/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/clients', { params });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch clients'); }
});
export const createClient = createAsyncThunk('clients/create', async (clientData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/clients', clientData);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create client'); }
});
export const updateClient = createAsyncThunk('clients/update', async ({ id, ...clientData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/clients/${id}`, clientData);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update client'); }
});
export const deleteClient = createAsyncThunk('clients/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/clients/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete client'); }
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearClientError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (s) => { s.loading = true; })
      .addCase(fetchClients.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.clients; s.pagination = a.payload.pagination; })
      .addCase(fetchClients.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createClient.fulfilled, (s, a) => { s.items.unshift(a.payload.client); })
      .addCase(updateClient.fulfilled, (s, a) => {
        const idx = s.items.findIndex(c => c._id === a.payload.client._id);
        if (idx !== -1) s.items[idx] = a.payload.client;
      })
      .addCase(deleteClient.fulfilled, (s, a) => { s.items = s.items.filter(c => c._id !== a.payload); });
  },
});
export const { clearClientError } = clientSlice.actions;
export default clientSlice.reducer;
