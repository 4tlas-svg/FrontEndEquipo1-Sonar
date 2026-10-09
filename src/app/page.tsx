'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_URL, errorMessage, getAccessToken, logout } from '@/lib/api';

type Report = {
  id: number;
  title: string;
  description: string;
  statusId: number;
  categoryName?: string | null;
  statusName?: string | null;
  evidenceUrl?: string | null;
  imagePath?: string | null;
  fraudProbability?: number | null;
  createdAt?: string;
};

// Catálogo de estados con colores
const STATUS_OPTIONS = [
  { id: 1, name: 'En revisión', color: '#facc15' }, // Amarillo
  { id: 2, name: 'Fraude', color: '#ef4444' },     // Rojo
  { id: 3, name: 'Confiable', color: '#22c55e' },   // Verde
];

export default function HomePage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Estado para el filtro por estado de validación ('ALL' o el ID numérico)
  const [statusFilter, setStatusFilter] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    fetchReports();
  }, [router]);

  const fetchReports = () => {
    api
      .get<Report[]>('/reports')
      .then(({ data }) => setReports(data))
      .catch((e) => setError(errorMessage(e)));
  };

  const handleStatusChange = async (reportId: number, newStatusId: number) => {
    setUpdatingId(reportId);
    try {
      await api.patch(`/reports/${reportId}/status`, { statusId: newStatusId });

      setReports((prev) =>
        prev
          ? prev.map((r) =>
              r.id === reportId
                ? {
                    ...r,
                    statusId: newStatusId,
                    statusName: STATUS_OPTIONS.find((s) => s.id === newStatusId)?.name || r.statusName,
                  }
                : r
            )
          : null
      );
    } catch (e) {
      alert(`Error al actualizar el estado: ${errorMessage(e)}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('¿Estás seguro de que deseas mover este reporte a la papelera?')) return;

    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => (prev ? prev.filter((r) => r.id !== reportId) : null));
    } catch (e) {
      alert(`Error al eliminar el reporte: ${errorMessage(e)}`);
    }
  };

  // ==========================================
  // CÁLCULOS ESTADÍSTICOS Y MÉTRICAS
  // ==========================================
  const totalReports = reports?.length || 0;

  // 1. Métricas Globales
  const resolvedCount = reports?.filter((r) => r.statusId !== 1).length || 0;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  // 2. Estado de Validación (Dona)
  const statusStats = STATUS_OPTIONS.map((status) => {
    const count = reports?.filter((r) => r.statusId === status.id).length || 0;
    const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
    return { ...status, count, percentage };
  });

  let accumulatedPct = 0;
  const gradientStops = statusStats.map((s) => {
    const start = accumulatedPct;
    accumulatedPct += s.percentage;
    return `${s.color} ${start}% ${accumulatedPct}%`;
  }).join(', ');

  const chartBackground = totalReports > 0 ? `conic-gradient(${gradientStops})` : '#27272a';

  // 3. Reportes por Categoría
  const categoriesMap = (reports || []).reduce((acc, r) => {
    const category = r.categoryName || 'Sin Categoría';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(categoriesMap).map(([name, count]) => ({
    name,
    count,
    percentage: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0,
  }));

  // 4. Tendencia Mensual
  const monthlyMap = (reports || []).reduce((acc, r) => {
    const date = r.createdAt ? new Date(r.createdAt) : new Date();
    const monthKey = date.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyStats = Object.entries(monthlyMap).map(([month, count]) => ({
    month: month.toUpperCase(),
    count,
  }));
  const maxMonthlyCount = Math.max(...monthlyStats.map((m) => m.count), 1);

  const filteredReports = reports?.filter((report) => {
    if (statusFilter === 'ALL') return true;
    return report.statusId === statusFilter;
  });

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', color: '#f4f4f5' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Sentinel — Panel Admin</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Métricas Generales y Gestión de Incidencias</p>
        </div>
        <button type="button" onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
          Cerrar sesión
        </button>
      </header>

      {/* ================= SECCIÓN DE GRÁFICAS Y DASHBOARD ================= */}
      {reports && reports.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* TARJETAS DE MÉTRICAS GLOBALES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '1.2rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block' }}>Total de Reportes</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{totalReports}</span>
            </div>
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '1.2rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block' }}>Tasa de Resolución</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>{resolutionRate}%</span>
            </div>
          </div>

          {/* GRID DE GRÁFICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* GRÁFICA 1: Estado de Validación (Dona) */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e4e4e7' }}>
                Estado de Validación
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    background: chartBackground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#18181b', borderRadius: '50%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '140px' }}>
                  {statusStats.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: s.color }}>● {s.name}</span>
                      <strong>{s.count} ({s.percentage.toFixed(0)}%)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GRÁFICA 2: Reportes por Categoría (Barras Horizontales) */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e4e4e7' }}>
                Reportes por Categoría
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {categoryStats.map((cat, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      <span>{cat.name}</span>
                      <span style={{ color: '#a1a1aa' }}>{cat.count}</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: '#27272a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${cat.percentage}%`,
                          backgroundColor: '#38bdf8',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GRÁFICA 3: Tendencia Mensual (Histograma Vertical) */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.5rem', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#e4e4e7' }}>
                Tendencia Mensual de Registros
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '140px', paddingTop: '1rem' }}>
                {monthlyStats.map((m, i) => {
                  const heightPct = Math.round((m.count / maxMonthlyCount) * 100);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.3rem' }}>{m.count}</span>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', backgroundColor: '#27272a', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${heightPct}%`,
                            backgroundColor: '#818cf8',
                            borderRadius: '4px',
                            transition: 'height 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.4rem' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}

      {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
      {!error && !reports && <p>Cargando reportes...</p>}
      {reports?.length === 0 && <p>Todavía no hay reportes registrados.</p>}

      {/* ================= BARRA DE TÍTULO Y FILTRO DE ESTADO ================= */}
      {reports && reports.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>Listado de Incidencias</h2>

          {/* Selector para filtrar la lista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Filtrar por estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              style={{
                backgroundColor: '#18181b',
                color: '#fff',
                border: '1px solid #3f3f46',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">Todos los estados</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay elementos en el filtro seleccionado */}
      {filteredReports && filteredReports.length === 0 && (
        <p style={{ color: '#a1a1aa', marginTop: '1rem', fontStyle: 'italic' }}>
          No hay reportes registrados con el estado seleccionado.
        </p>
      )}

      {/* ================= LISTADO DE REPORTES FILTRADO ================= */}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredReports?.map((report) => (
          <li key={report.id} style={{ borderBottom: '1px solid #333', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                {report.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Estado:</label>
                  <select
                    value={report.statusId}
                    disabled={updatingId === report.id}
                    onChange={(e) => handleStatusChange(report.id, Number(e.target.value))}
                    style={{
                      backgroundColor: '#18181b',
                      color: '#fff',
                      border: '1px solid #3f3f46',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
                  style={{
                    backgroundColor: '#7f1d1d',
                    color: '#fca5a5',
                    border: '1px solid #991b1b',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p style={{ margin: '0.2rem 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#fff' }}>Tipo: </strong>
              <span style={{ color: '#60a5fa' }}>{report.categoryName || 'Sin categoría'}</span>
            </p>

            {report.evidenceUrl && (
              <p style={{ margin: '0.2rem 0', color: '#a1a1aa' }}>
                <strong style={{ color: '#fff' }}>Enlace reportado: </strong>
                <a
                  href={report.evidenceUrl.startsWith('http') ? report.evidenceUrl : `https://${report.evidenceUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'underline' }}
                >
                  {report.evidenceUrl}
                </a>
              </p>
            )}

            {report.fraudProbability !== null && report.fraudProbability !== undefined && (
              <p style={{ margin: '0.2rem 0', color: '#a1a1aa' }}>
                <strong style={{ color: '#fff' }}>Riesgo estimado: </strong>
                <span style={{ color: '#f87171', fontWeight: 'bold' }}>{report.fraudProbability}%</span>
              </p>
            )}

            <p style={{ marginTop: '0.6rem', color: '#e4e4e7', lineHeight: '1.5' }}>
              {report.description}
            </p>

            {report.imagePath && (
              <div style={{ marginTop: '0.8rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa' }}>Captura adjunta:</strong>
                <img
                  src={`${API_URL}/uploads/${report.imagePath}`}
                  alt={report.title}
                  style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '6px', border: '1px solid #3f3f46', objectFit: 'cover' }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}