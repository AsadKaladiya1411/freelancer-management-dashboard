import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { DollarSign, Users, FolderKanban, AlertTriangle, TrendingUp } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await api.get('/dashboard');
        setData(d);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  const monthlyChart = data?.monthlyEarnings?.length > 0 ? {
    labels: data.monthlyEarnings.map((m) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[m.month - 1]} ${m.year}`;
    }),
    datasets: [{
      label: 'Revenue',
      data: data.monthlyEarnings.map((m) => m.total),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  } : null;

  const statusChart = data?.projectsByStatus?.length > 0 ? {
    labels: data.projectsByStatus.map((p) => p.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [{
      data: data.projectsByStatus.map((p) => p.count),
      backgroundColor: ['#8b5cf6', '#6366f1', '#f59e0b', '#10b981', '#ef4444'],
      borderColor: 'transparent',
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Here's your business overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total Earnings" value={`₹${(data?.totalEarnings || 0).toLocaleString()}`} color="green" />
        <StatCard icon={Users} label="Total Clients" value={data?.totalClients || 0} color="blue" />
        <StatCard icon={FolderKanban} label="Total Projects" value={data?.totalProjects || 0} color="purple" />
        <StatCard icon={TrendingUp} label="Avg. per Project" value={`₹${data?.totalProjects ? Math.round(data.totalEarnings / data.totalProjects).toLocaleString() : 0}`} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Revenue Overview</h3>
          {monthlyChart ? (
            <div className="h-72">
              <Line data={monthlyChart} options={chartOptions} />
            </div>
          ) : (
            <p className="text-surface-400 text-center py-12">No earnings data yet</p>
          )}
        </div>

        {/* Status Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Project Status</h3>
          {statusChart ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={statusChart} options={{ ...chartOptions, cutout: '65%', plugins: { ...chartOptions.plugins, legend: { display: true, position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }, scales: {} }} />
            </div>
          ) : (
            <p className="text-surface-400 text-center py-12">No projects yet</p>
          )}
        </div>
      </div>

      {/* Recent Payments + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recent Payments</h3>
          </div>
          {data?.recentPayments?.length > 0 ? (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {data.recentPayments.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">{p.project?.title || 'N/A'}</p>
                    <p className="text-xs text-surface-500">{p.client?.name || '—'}</p>
                  </div>
                  <span className="font-bold text-emerald-500 text-sm">₹{p.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-8">No payments recorded</p>
          )}
        </div>

        {/* Overdue Projects */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Overdue Projects</h3>
          </div>
          {data?.overdueProjects?.length > 0 ? (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {data.overdueProjects.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">{p.title}</p>
                    <p className="text-xs text-surface-500">{p.client?.name || '—'}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                    Due {new Date(p.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-8">No overdue projects 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
