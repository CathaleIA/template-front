'use client';

import React, { lazy, Suspense, useState } from 'react';

const ChatSidebar = lazy(() => import('@/components/componentsRealTime/ChatSidebar'));

export default function GlobalChatProvider({ children }: { children: React.ReactNode }) {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
            {children}
            <Suspense fallback={null}>
                <ChatSidebar isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
            </Suspense>
        </>
    );
}
