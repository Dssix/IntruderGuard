import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: 'IntruderGuard - Command Center',
  description: 'Intrusion Detection System Interface',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-dark-bg text-text-primary min-h-screen flex flex-col">
        <header className="bg-dark-surface border-b border-dark-border p-4 shadow-md">
          <h1 className="text-2xl font-mono font-bold text-accent-glow tracking-wider">
            IntruderGuard // Tactical Interface
          </h1>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
          {children}
        </main>
        <footer className="bg-dark-surface border-t border-dark-border p-4 text-center text-text-secondary text-sm">
          © {new Date().getFullYear()} IntruderGuard Systems. All rights reserved. [CLASSIFIED]
        </footer>
      </body>
    </html>
  );
}