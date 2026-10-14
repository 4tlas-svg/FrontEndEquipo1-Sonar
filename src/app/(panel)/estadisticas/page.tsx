'use client';

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePanel } from '@/components/panel/PanelProvider';

const tooltipStyle = {
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#fff',
};

export default function StatsPage() {
  const { reports, error, reload } = usePanel();

  const totalReports = reports?.length || 0;
  const inReviewCount = reports?.filter((r) => r.statusId === 1).length || 0;
  const fraudCount = reports?.filter((r) => r.statusId === 2).length || 0;
  const reliableCount = reports?.filter((r) => r.statusId === 3).length || 0;

  const resolvedCount = reports?.filter((r) => r.statusId !== 1).length || 0;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  const statusChartData = [
    { name: 'En revisión', value: inReviewCount, color: '#facc15' },
    { name: 'Fraude', value: fraudCount, color: '#ff003c' },
    { name: 'Confiable', value: reliableCount, color: '#22c55e' },
  ];

  const categoryMap =
    reports?.reduce(
      (acc, r) => {
        const cat = r.categoryName || 'Sin categoría';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const categoryChartData = Object.entries(categoryMap).map(([name, total]) => ({ name, total }));

  return (
    <section className="space-y-6" aria-labelledby="titulo-estadisticas">
      <h2 id="titulo-estadisticas" className="text-3xl font-extrabold tracking-tight text-white italic">
        Métricas y Analíticas
      </h2>

      {error && (
        <Card role="alert" className="bg-red-950/60 border-red-800 text-red-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">No se pudieron cargar las estadísticas</CardTitle>
            <CardDescription className="text-xs text-red-200">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={reload}
              className="h-9 px-4 rounded-lg bg-red-100 hover:bg-white text-red-950 text-xs font-bold cursor-pointer"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      )}

      {!reports && !error && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full bg-[#1b2d48] rounded-2xl" />
          <Skeleton className="h-72 w-full bg-[#1b2d48] rounded-2xl" />
        </div>
      )}

      {reports && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Total de Reportes</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-white">{totalReports}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Tasa de Resolución</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-sky-400">{resolutionRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">En Revisión</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-yellow-400">{inReviewCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Casos de Fraude</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-[#ff003c]">{fraudCount}</CardTitle>
              </CardHeader>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-white">Distribución por Estado</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Proporción de casos en revisión, confirmados como fraude o validados como confiables.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-5 flex flex-col justify-between items-center min-h-[270px]">
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> En revisión ({inReviewCount})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff003c] inline-block" /> Fraude ({fraudCount})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Confiable ({reliableCount})
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-white">Reportes por Categoría</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Volumen total acumulado de incidencias agrupadas por categoría.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-5 min-h-[270px] flex items-center justify-center">
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="total" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </section>
  );
}
