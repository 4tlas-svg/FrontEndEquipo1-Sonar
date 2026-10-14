'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvidenceList } from '@/components/panel/EvidenceList';
import { formatDate } from '@/lib/format';
import { CASE_TYPES, STATUS_OPTIONS, type Report } from '@/lib/types';

type Props = {
  report: Report;
  updating: boolean;
  onStatusChange: (reportId: number, statusId: number) => void;
  onDelete: (reportId: number) => void;
};

export function ReportCard({ report, updating, onStatusChange, onDelete }: Props) {
  const status = STATUS_OPTIONS.find((s) => s.id === report.statusId);
  const isSignal = report.caseType === 'señalamiento';

  return (
    <Card className="bg-[#e2e4e8] border-none text-zinc-900 rounded-2xl p-2 shadow-lg w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 pt-3 px-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border-none ${
                isSignal ? 'bg-sky-200 text-sky-900' : 'bg-violet-200 text-violet-900'
              }`}
            >
              {CASE_TYPES[report.caseType] ?? report.caseType}
            </Badge>
            {report.createdAt && (
              <time dateTime={report.createdAt} className="text-[11px] font-medium text-zinc-500">
                {formatDate(report.createdAt)}
              </time>
            )}
          </div>

          <CardTitle className="text-lg font-extrabold text-zinc-900 italic leading-snug">{report.title}</CardTitle>

          {(report.reporterName || report.reporterEmail) && (
            <p className="text-xs text-zinc-600 font-medium flex flex-wrap items-center gap-1.5 pt-0.5">
              <span>Reportado por:</span>
              <span className="font-bold text-zinc-900">{report.reporterName || 'Usuario'}</span>
              {report.reporterEmail && (
                <span className="text-[11px] font-mono text-zinc-500">({report.reporterEmail})</span>
              )}
            </p>
          )}

          {report.evidenceUrl && (
            <p className="text-xs font-mono truncate pt-0.5">
              <a
                href={report.evidenceUrl.startsWith('http') ? report.evidenceUrl : `https://${report.evidenceUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 hover:text-sky-900 underline font-semibold transition-colors"
              >
                {report.evidenceUrl}
              </a>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <Badge className="bg-white text-zinc-900 border border-zinc-300 font-semibold text-[11px] px-3 py-1 rounded-full shadow-xs">
              {report.categoryName || 'Sin categoría'}
            </Badge>
            {status && (
              <Badge className={`${status.badge} font-extrabold text-[11px] px-3 py-1 rounded-full border-none shadow-xs`}>
                {status.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={String(report.statusId)}
            disabled={updating}
            onValueChange={(value) => onStatusChange(report.id, Number(value))}
          >
            <SelectTrigger
              aria-label="Cambiar estado"
              className="w-[130px] h-8 text-xs bg-white dark:bg-white dark:hover:bg-zinc-50 border-zinc-300 text-zinc-900 font-semibold rounded-lg shadow-xs"
            >
              <SelectValue>{status?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200 text-zinc-900">
              {STATUS_OPTIONS.map((st) => (
                <SelectItem key={st.id} value={String(st.id)} className="text-xs font-medium">
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger className="h-8 text-xs px-3.5 font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center">
              Eliminar
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  El reporte se moverá a la papelera; desde ahí lo puedes restaurar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(report.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-4 pb-3 space-y-2">
        <p className="text-xs text-zinc-800 leading-relaxed font-medium">{report.description}</p>
        <EvidenceList reportId={report.id} title={report.title} skipUrl={report.evidenceUrl} />
      </CardContent>
    </Card>
  );
}
