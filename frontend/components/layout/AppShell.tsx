"use client";

import clsx from "clsx";

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export default function AppShell({ children, sidebar, header }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <header className="border-b border-border bg-surface">{header}</header>}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="w-64 shrink-0 border-r border-border bg-surface-subtle">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
