export type CaseType = 'report' | 'señalamiento';

export type Report = {
  id: number;
  title: string;
  description: string;
  caseType: CaseType;
  categoryId: number;
  categoryName?: string | null;
  statusId: number;
  statusName?: string | null;
  evidenceUrl?: string | null;
  createdAt?: string;
  approvedAt?: string | null;
  deletedAt?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
};

export type User = {
  id: number;
  email: string;
  name?: string | null;
  role: string;
};

export type Evidence = {
  id: number;
  type: 'url' | 'text' | 'phone' | 'image';
  url?: string;
  content?: string;
  createdAt?: string;
};

export const STATUS_OPTIONS = [
  { id: 1, name: 'En revisión', badge: 'bg-[#facc15] text-zinc-950' },
  { id: 2, name: 'Fraude', badge: 'bg-[#ff003c] text-white' },
  { id: 3, name: 'Confiable', badge: 'bg-[#22c55e] text-zinc-950' },
];

export const CASE_TYPES: Record<CaseType, string> = {
  report: 'Reporte',
  señalamiento: 'Señalamiento',
};
