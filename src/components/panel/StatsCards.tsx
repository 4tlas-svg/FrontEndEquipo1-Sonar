import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Report } from '@/lib/types';

export function StatsCards({ reports }: { reports: Report[] }) {
  const total = reports.length;
  const resolved = reports.filter((r) => r.statusId !== 1).length;
  const stats = [
    { label: 'Total de Reportes', value: String(total), color: 'text-white' },
    {
      label: 'Tasa de Resolución',
      value: `${total > 0 ? Math.round((resolved / total) * 100) : 0}%`,
      color: 'text-sky-400',
    },
    { label: 'En Revisión', value: String(total - resolved), color: 'text-yellow-400' },
    {
      label: 'Casos de Fraude',
      value: String(reports.filter((r) => r.statusId === 2).length),
      color: 'text-[#ff003c]',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
          <CardHeader className="pb-1.5 pt-4">
            <CardDescription className="text-zinc-300 text-xs font-medium">{stat.label}</CardDescription>
            <CardTitle className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}
