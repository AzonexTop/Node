import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monorepo App',
  description: 'Next.js application in monorepo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
