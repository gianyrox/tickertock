import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TickerTock - Real-time Stock & Crypto Tracker',
  description: 'Track stock and cryptocurrency prices in real-time with customizable data views and charts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Inline script to initialize API key from localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    window.__INIT_FINNHUB_KEY__ = localStorage.getItem('tickertock_finnhub_api_key');
                  }
                } catch (e) {
                  console.error('Error initializing API key:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <header style={{
          backgroundColor: 'var(--primary-color)',
          padding: '1rem 0',
          color: 'white'
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ fontSize: '1.5rem' }}>Tickertock</h1>
            <nav>
              <ul style={{
                display: 'flex',
                listStyle: 'none',
                gap: '1.5rem'
              }}>
                <li>
                  <a href="/" style={{ color: 'white' }}>Home</a>
                </li>
                <li>
                  <a href="/about" style={{ color: 'white' }}>About</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="container" style={{ padding: '2rem 0' }}>
          {children}
        </main>
        <footer style={{
          backgroundColor: 'var(--light-gray)',
          padding: '1.5rem 0',
          marginTop: '2rem'
        }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <p>© {new Date().getFullYear()} Tickertock. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 