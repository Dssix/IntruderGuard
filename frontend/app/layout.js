import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: 'IntruderGuard - Command Center | Tactical UI',
  description: 'Advanced Intrusion Detection System Interface with Dynamic Visuals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* Removed animated gradient, using a static dark background with a subtle dynamic gradient overlay from globals.css */}
      <body className="bg-dark-bg text-text-primary min-h-screen flex flex-col">
        {/* Add a div for the static cool background design if needed, or apply to body directly */}
        {/* For now, relying on the body's base dark theme and the bg-dynamic-gradient on page.js content */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-dark-bg">
          <div className="absolute inset-0 -z-20 h-full w-full bg-dynamic-gradient opacity-30"></div>
        </div>

        <header className="bg-dark-surface/80 backdrop-blur-md border-b border-dark-border p-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-mono font-bold text-glow tracking-wider animate-subtle-float">
              IntruderGuard // Tactical UI
            </h1>
            <div className="text-xs text-text-secondary">
              SYSTEM ONLINE
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8 z-10">
          {children}
        </main>
        <footer className="bg-dark-surface/80 backdrop-blur-md border-t border-dark-border p-4 text-center text-text-secondary text-xs z-10">
          © {new Date().getFullYear()} IntruderGuard Systems. All rights reserved. [CLASSIFIED // SECURE CHANNEL]
        </footer>
      </body>
    </html>
  );
}