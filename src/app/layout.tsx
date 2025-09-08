'use client';
import { ModeToggle } from '@/app/theme/page';
import './globals.css';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <ModeToggle/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
