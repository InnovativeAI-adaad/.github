import type { PropsWithChildren } from 'react';

interface DashboardPanelProps extends PropsWithChildren {
  title: string;
}

export function DashboardPanel({ title, children }: DashboardPanelProps) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
