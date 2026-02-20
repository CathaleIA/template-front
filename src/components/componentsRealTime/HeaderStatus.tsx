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
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${error
          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          : connected
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
          }`}>
          {error ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </>
          ) : connected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">En Línea</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Conectando...</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right">
        {subtitle && <p className="text-xs text-muted-foreground mb-0.5">{subtitle}</p>}
        <p className="text-xs text-muted-foreground/60 font-mono">
          Última actualización: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
        </p>
      </div>
    </div>
  );
}