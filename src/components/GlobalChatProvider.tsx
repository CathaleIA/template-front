'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import ChatSidebar from '@/components/componentsRealTime/ChatSidebar';

export default function GlobalChatProvider({ children }: { children: React.ReactNode }) {
    const [chatOpen, setChatOpen] = useState(false);
    const { userr, loading } = useUser();
    const pathname = usePathname();

    // Rutas donde NO se debe mostrar el chat (Login, Selección de Tenant, Reportes independientes)
    const isExcludedPath = pathname === '/select-tenant' || pathname.startsWith('/reports/');

    // Solo mostrar el chat si el usuario está autenticado y NO está en una ruta excluida
    const shouldShowChat = !loading && userr !== null && !isExcludedPath;

    return (
        <>
            {children}
            {shouldShowChat && (
                <ChatSidebar isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
            )}
        </>
    );
}
