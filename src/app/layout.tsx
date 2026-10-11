import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner'; 
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sentinel — Dashboard',
  description: 'Panel de administración e inspección de reportes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#132238] text-zinc-100 antialiased`}>
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
