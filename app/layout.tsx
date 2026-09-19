import type { Metadata } from 'next';
import '@/frontend/styles/globals.css';

export const metadata: Metadata = {
  title: 'Varun Kehlawat — Full Stack Developer & BCA AI+DS Student',
  description:
    'Personal portfolio of Varun Kehlawat — Full Stack Developer, BCA AI & DS student, passionate about tech and AI models. Explore projects, skills, and contact info.',
  keywords: ['Varun Kehlawat', 'Full Stack Developer', 'BCA AI DS', 'React', 'Next.js', 'Portfolio'],
  authors: [{ name: 'Varun Kehlawat', url: 'https://www.linkedin.com/in/varun-kehlawat-662a81379/' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Varun Kehlawat — Full Stack Developer',
    description: 'Full Stack Developer & BCA AI+DS Student. Building the future with code.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Varun Kehlawat — Full Stack Developer',
    description: 'Full Stack Developer & BCA AI+DS Student. Building the future with code.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
