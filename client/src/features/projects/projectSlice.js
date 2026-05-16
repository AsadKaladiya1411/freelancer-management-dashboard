import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await API.get('/projects', { params }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createProject = createAsyncThunk('projects/create', async (d, { rejectWithValue }) => {
  try { const { data } = await API.post('/projects', d); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateProject = createAsyncThunk('projects/update', async ({ id, ...d }, { rejectWithValue }) => {
  try { const { data } = await API.put(`/projects/${id}`, d); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { await API.delete(`/projects/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearProjectError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.projects; s.pagination = a.payload.pagination; })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { s.items.unshift(a.payload.project); })
      .addCase(updateProject.fulfilled, (s, a) => {
        const i = s.items.findIndex(p => p._id === a.payload.project._id);
        if (i !== -1) s.items[i] = a.payload.project;
      })
      .addCase(deleteProject.fulfilled, (s, a) => { s.items = s.items.filter(p => p._id !== a.payload); });
  },
});
export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
