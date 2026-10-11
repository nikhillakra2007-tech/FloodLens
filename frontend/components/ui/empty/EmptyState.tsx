interface EmptyStateProps {
  message: string;
  hint?: string;
}

export default function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-subtle p-4 text-center">
      <p className="text-sm text-gray-500">{message}</p>
      {hint && <p className="mt-1 text-2xs text-gray-400">{hint}</p>}
    </div>
  );
}
