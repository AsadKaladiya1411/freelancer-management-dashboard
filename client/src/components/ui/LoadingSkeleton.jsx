export default function LoadingSkeleton({ rows = 5, type = 'table' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-6 space-y-4">
            <div className="shimmer h-12 w-12 rounded-xl" />
            <div className="shimmer h-4 w-24" />
            <div className="shimmer h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-surface-100 dark:border-surface-700/50 flex gap-4">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="shimmer h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
