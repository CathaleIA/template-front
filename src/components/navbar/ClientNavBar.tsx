'use client';

import { usePathname } from 'next/navigation';
import NavBar from '@/components/navbar/NavBar';

interface NavbarProps {
  currentUser: {
    userId: string;
    username: string;
    signInDetails?: {
      loginId?: string;
      authFlowType?: string;
    };
  } | null;
}

export default function ClientNavBar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }
  return <NavBar currentUser={currentUser}/>;
}