'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { api, API_URL } from '@/lib/api';
import type { Evidence } from '@/lib/types';

type Props = {
  reportId: number;
  title: string;
  skipUrl?: string | null;
};

export function EvidenceList({ reportId, title, skipUrl }: Props) {
  const [items, setItems] = useState<Evidence[]>([]);
  const [zoomed, setZoomed] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<Evidence[]>(`/reports/${reportId}/evidence`)
      .then(({ data }) => active && setItems(data))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [reportId]);

  const images = items.filter((e) => e.type === 'image' && e.url);
  const texts = items.filter((e) => e.type === 'text' && e.content);
  const phones = items.filter((e) => e.type === 'phone' && e.content);
  const urls = items.filter((e) => e.type === 'url' && e.content && e.content !== skipUrl);

  if (images.length + texts.length + phones.length + urls.length === 0) return null;

  return (
    <div className="pt-1 space-y-2">
      <span className="block text-[11px] font-semibold text-zinc-600">Evidencia adjunta:</span>

      {texts.map((e) => (
        <blockquote
          key={e.id}
          className="text-xs text-zinc-800 bg-white border-l-4 border-[#facc15] rounded-r-lg px-3 py-2 whitespace-pre-wrap"
        >
          {e.content}
        </blockquote>
      ))}

      {(phones.length > 0 || urls.length > 0) && (
        <ul className="flex flex-wrap gap-2 text-xs">
          {phones.map((e) => (
            <li key={e.id} className="bg-white border border-zinc-300 rounded-full px-3 py-1 font-mono">
              Tel. {e.content}
            </li>
          ))}
          {urls.map((e) => (
            <li key={e.id} className="bg-white border border-zinc-300 rounded-full px-3 py-1 font-mono break-all">
              {e.content}
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image) => {
            const src = `${API_URL}${image.url}`;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setZoomed(src)}
                className="shrink-0 cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-[#132238]"
                aria-label={`Ampliar captura de ${title}`}
              >
                <Image
                  src={src}
                  alt={title}
                  width={240}
                  height={320}
                  unoptimized
                  className="h-52 w-auto rounded-xl border border-zinc-300 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-3xl sm:max-w-3xl p-3">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {zoomed && (
            <Image
              src={zoomed}
              alt={title}
              width={1080}
              height={1440}
              unoptimized
              className="max-h-[80vh] w-full h-auto object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
