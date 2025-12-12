'use client';
import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

type Props = {
  connected: boolean;
  lastUpdate: Date | null;
  error: string | null;
  subtitle?: string;
};

export default function HeaderStatus({ connected, lastUpdate, error, subtitle }: Props) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        error 
          ? 'bg-red-50 border-red-200 text-red-700'
          : connected 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
        {error ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </>
        ) : connected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Connecting...</span>
          </>
        )}
      </div>
      
      <div className="text-right">
        {subtitle && <p className="text-xs text-slate-500 mb-0.5">{subtitle}</p>}
        <p className="text-xs text-slate-400 font-mono">
          Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
        </p>
      </div>
    </div>
  );
}