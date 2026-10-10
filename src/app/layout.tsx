import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PATHORA — Your dream job. Reverse-engineered.',
  description:
    'Advanced AI-powered career intelligence platform that reverse-engineers a student’s hyper-specific dream job into a personalized, visually interactive, realistic, adaptive career roadmap.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234F46E5%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/><polygon points=%2216.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Tailwind CDN ensures instant, flawless, zero-compilation styling across all browsers */}
        <script src="https://cdn.tailwindcss.com" suppressHydrationWarning></script>
      </head>
      <body
        className="min-h-full flex flex-col bg-[#fbfbfa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

