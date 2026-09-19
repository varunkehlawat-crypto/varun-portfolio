import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Varun Kehlawat — Full Stack Developer & BCA AI+DS Student',
  description:
    'Personal portfolio of Varun Kehlawat — Full Stack Developer, BCA AI & DS student, passionate about tech and AI models. Explore projects, skills, and contact info.',
  keywords: ['Varun Kehlawat', 'Full Stack Developer', 'BCA AI DS', 'React', 'Next.js', 'Portfolio'],
  authors: [{ name: 'Varun Kehlawat', url: 'https://www.linkedin.com/in/varun-kehlawat-662a81379/' }],
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
