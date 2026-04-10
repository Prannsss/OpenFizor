import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { GooeyToaster } from '@/components/ui/goey-toaster';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'OpenFizor',
  description: 'Compress Files using Quantization',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@300&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <GooeyToaster position="bottom-right" />
      </body>
    </html>
  );
}
