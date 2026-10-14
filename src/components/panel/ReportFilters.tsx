'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CASE_TYPES, STATUS_OPTIONS, type CaseType } from '@/lib/types';

export type Filters = {
  search: string;
  status: number | 'ALL';
  caseType: CaseType | 'ALL';
  category: string;
};

export const EMPTY_FILTERS: Filters = { search: '', status: 'ALL', caseType: 'ALL', category: 'ALL' };

type Props = {
  filters: Filters;
  categories: string[];
  onChange: (filters: Filters) => void;
};

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
        active ? 'bg-[#facc15] text-zinc-950 shadow-md' : 'bg-[#e2e4e8] text-zinc-900 hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
}

export function ReportFilters({ filters, categories, onChange }: Props) {
  const set = (changes: Partial<Filters>) => onChange({ ...filters, ...changes });

  return (
    <section className="space-y-3 pt-2 border-t border-zinc-700/60">
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          type="search"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Buscar por título, descripción, URL o persona que reportó"
          aria-label="Buscar reportes"
          className="bg-white dark:bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 h-9 rounded-xl text-sm md:flex-1"
        />
        <Select value={filters.category} onValueChange={(value) => set({ category: String(value ?? 'ALL') })}>
          <SelectTrigger
            aria-label="Filtrar por categoría"
            className="w-full md:w-[230px] h-9 text-xs bg-white dark:bg-white dark:hover:bg-zinc-50 border-zinc-300 text-zinc-900 font-semibold rounded-xl"
          >
            <SelectValue>{filters.category === 'ALL' ? 'Todas las categorías' : filters.category}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900">
            <SelectItem value="ALL" className="text-xs font-medium">
              Todas las categorías
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category} className="text-xs font-medium">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pill active={filters.status === 'ALL'} onClick={() => set({ status: 'ALL' })}>
          Todos los estados
        </Pill>
        {STATUS_OPTIONS.map((status) => (
          <Pill key={status.id} active={filters.status === status.id} onClick={() => set({ status: status.id })}>
            {status.name}
          </Pill>
        ))}
        <span className="mx-1 h-5 w-px bg-zinc-600" aria-hidden />
        <Pill active={filters.caseType === 'ALL'} onClick={() => set({ caseType: 'ALL' })}>
          Todos los casos
        </Pill>
        {(Object.keys(CASE_TYPES) as CaseType[]).map((caseType) => (
          <Pill key={caseType} active={filters.caseType === caseType} onClick={() => set({ caseType })}>
            {CASE_TYPES[caseType]}s
          </Pill>
        ))}
      </div>
    </section>
  );
}
