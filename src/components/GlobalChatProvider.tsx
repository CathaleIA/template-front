'use client';

import React, { lazy, Suspense, useState } from 'react';
import { useUser } from '@/context/UserContext';

const ChatSidebar = lazy(() => import('@/components/componentsRealTime/ChatSidebar'));

export default function GlobalChatProvider({ children }: { children: React.ReactNode }) {
    const [chatOpen, setChatOpen] = useState(false);
    const { userr, loading } = useUser();

    // Solo mostrar el chat si el usuario está autenticado
    const shouldShowChat = !loading && userr !== null;

    return (
        <>
            {children}
            {shouldShowChat && (
                <Suspense fallback={null}>
                    <ChatSidebar isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
                </Suspense>
            )}
        </>
    );
}
