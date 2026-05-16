import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/clients/clientSlice';
import projectReducer from '../features/projects/projectSlice';
import paymentReducer from '../features/payments/paymentSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    projects: projectReducer,
    payments: paymentReducer,
    dashboard: dashboardReducer,
    theme: themeReducer,
  },
});
