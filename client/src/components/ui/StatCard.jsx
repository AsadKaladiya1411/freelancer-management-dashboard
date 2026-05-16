export default function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-700 shadow-primary-500/25',
    green: 'from-emerald-500 to-emerald-700 shadow-emerald-500/25',
    blue: 'from-blue-500 to-blue-700 shadow-blue-500/25',
    purple: 'from-violet-500 to-purple-700 shadow-violet-500/25',
    orange: 'from-orange-500 to-orange-700 shadow-orange-500/25',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[color]} p-6 text-white shadow-lg hover:scale-[1.02] transition-transform duration-300 cursor-default`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon size={24} />
          </div>
          {trend && (
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">
              {trend}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
