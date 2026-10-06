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

const STATUS_OPTIONS = [
  { id: 1, name: 'En revisión' },
  { id: 2, name: 'Fraude' },
  { id: 3, name: 'Confiable' },
];

export default function HomePage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  // Función para cambiar el status en la API
  const handleStatusChange = async (reportId: number, newStatusId: number) => {
    setUpdatingId(reportId);
    try {
      // Endpoint corregido hacia la ruta de administradores: /reports/:id/status
      await api.patch(`/reports/${reportId}/status`, { statusId: newStatusId });

      // Actualización de la UI tras la respuesta exitosa
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

  return (
    <main style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Sentinel — Panel Admin</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Gestión de Reportes e Incidencias</p>
        </div>
        <button type="button" onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </header>

      {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
      {!error && !reports && <p>Cargando reportes...</p>}
      {reports?.length === 0 && <p>Todavía no hay reportes registrados.</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reports?.map((report) => (
          <li key={report.id} style={{ borderBottom: '1px solid #333', paddingBottom: '1.5rem' }}>
            {/* Encabezado del reporte */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                {report.title}
              </h2>

              {/* CONTROL DE CAMBIO DE ESTADO (ADMIN) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Cambiar estado:</label>
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
            </div>

            {/* Categoría y Estado actual */}
            <p style={{ margin: '0.2rem 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#fff' }}>Tipo: </strong>
              <span style={{ color: '#60a5fa' }}>{report.categoryName || 'Sin categoría'}</span>
            </p>

            {/* Enlace reportado */}
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

            {/* Riesgo */}
            {report.fraudProbability !== null && report.fraudProbability !== undefined && (
              <p style={{ margin: '0.2rem 0', color: '#a1a1aa' }}>
                <strong style={{ color: '#fff' }}>Riesgo estimado: </strong>
                <span style={{ color: '#f87171', fontWeight: 'bold' }}>{report.fraudProbability}%</span>
              </p>
            )}

            {/* Descripción */}
            <p style={{ marginTop: '0.6rem', color: '#e4e4e7', lineHeight: '1.5' }}>
              {report.description}
            </p>

            {/* Imagen / Evidencia */}
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