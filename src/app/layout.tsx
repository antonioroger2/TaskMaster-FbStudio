
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it causes module not found error
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from './providers';
import { AuthProvider } from '@/context/auth-context';


export const metadata: Metadata = {
  title: 'TaskMaster',
  description: 'Your personal task management solution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable}`}>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
