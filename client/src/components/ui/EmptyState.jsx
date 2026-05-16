import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="card p-12 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 mb-6">
        <Icon size={32} className="text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
        {title}
      </h3>
      <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && action}
    </div>
  );
}
