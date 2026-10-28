import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'FLOODX — AI-Powered Flood Intelligence | Presidency University (SIH 2026)',
  description:
    'A unified operational flood disaster intelligence platform for disaster management authorities (NDMA/SDMA), urban local bodies, emergency responders, and vulnerable communities. Predict. Understand. Simulate. Act.',
  keywords: [
    'Flood Intelligence',
    'AI Flood Prediction',
    'Smart India Hackathon 2026',
    'Presidency University Bengaluru',
    'Hydrological Simulation',
    'SCS-CN Runoff',
    'Disaster Management',
    'NDMA',
    'IMD Weather Radar',
    'GIS Flood Map',
  ],
  authors: [{ name: 'Presidency University Bengaluru / SIH 2026 Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-cyan-500 selection:text-white bg-flood-bg min-h-screen text-slate-100">
        {children}
      </body>
    </html>
  );
}
