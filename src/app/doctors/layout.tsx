import { Navbar } from '@/components/Navbar';

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
} 