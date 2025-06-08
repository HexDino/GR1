import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import dynamic from 'next/dynamic';

// Import ChatbotButton với dynamic để tránh lỗi hydration
const ChatbotButton = dynamic(() => import('@/components/ChatbotButton'), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Medical Appointment System',
  description: 'Book appointments with the best doctors in town',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatbotButton />
      </body>
    </html>
  );
} 