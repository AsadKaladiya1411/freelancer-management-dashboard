import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from './dashboardSlice';
import { FiDollarSign, FiUsers, FiFolder, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  if (loading || !data) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Earnings', value: `₹${(data.totalEarnings || 0).toLocaleString()}`, icon: FiDollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Total Clients', value: data.totalClients || 0, icon: FiUsers, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Total Projects', value: data.totalProjects || 0, icon: FiFolder, gradient: 'from-purple-500 to-pink-600' },
  ];

  const monthlyChart = {
    labels: (data.monthlyEarnings || []).map(m => `${months[m.month - 1]} ${m.year}`),
    datasets: [{
      label: 'Earnings', data: (data.monthlyEarnings || []).map(m => m.total),
      borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.08)',
      borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#667eea', pointBorderColor: '#fff', pointBorderWidth: 2,
    }],
  };

  const colors = ['#667eea','#d946ef','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899'];
  const clientChart = {
    labels: (data.clientWiseEarnings || []).map(c => c.clientName),
    datasets: [{
      data: (data.clientWiseEarnings || []).map(c => c.total),
      backgroundColor: colors, borderColor: '#fff', borderWidth: 3, hoverOffset: 8,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your business at a glance</p></div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card bg-gradient-to-br ${s.gradient} group hover:-translate-y-1 transition-all duration-300 cursor-default`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <s.icon className="text-3xl mb-3 opacity-90" />
            <p className="text-sm font-medium opacity-80">{s.label}</p>
            <p className="text-3xl font-extrabold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {data.monthlyEarnings?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><FiTrendingUp className="text-primary-500" />
              <h3 className="font-bold text-gray-800 dark:text-white">Monthly Earnings</h3></div>
            <Line data={monthlyChart} options={{ responsive: true, plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
          </div>
        )}
        {data.clientWiseEarnings?.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><FiUsers className="text-primary-500" />
              <h3 className="font-bold text-gray-800 dark:text-white">Client-wise Earnings</h3></div>
            <Doughnut data={clientChart} options={{ responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } } } }} />
          </div>
        )}
      </div>

      {/* Overdue Projects */}
      {data.overdueProjects?.length > 0 && (
        <div className="card p-6 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4"><FiAlertCircle className="text-red-500" />
            <h3 className="font-bold text-red-600 dark:text-red-400">Overdue Projects</h3></div>
          <div className="space-y-2">
            {data.overdueProjects.map((p) => (
              <div key={p._id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <span className="font-medium text-gray-800 dark:text-gray-200">{p.title}</span>
                <span className="text-sm text-red-500">{p.client?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
