import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Funni Bippi — World without strangers.',
  description:
    'Chat anonymously with a random stranger in real time. No accounts, no profiles — just conversation.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ margin: 0, height: '100dvh', overflow: 'hidden' }} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
