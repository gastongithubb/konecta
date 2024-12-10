// app/metrics/layout.tsx
import MetricsSidebar from '@/components/metrics/MetricsSidebar';

export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MetricsSidebar>{children}</MetricsSidebar>;
}