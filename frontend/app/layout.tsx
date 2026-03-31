import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tırtıl - Kelime Zinciri',
  description: 'Premium Kelime Zinciri Oyunu',
  icons: {
    icon: '/vercel_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-black text-white antialiased">
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
