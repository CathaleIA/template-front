// industrial-iot-lab/dashboard-industrial/src/components/GeneralStatusCard.tsx
'use client';
import React from 'react';
import { Zap } from 'lucide-react';

type Props = {
  activa: number;
  reactiva: number;
  aparente: number;
  fp: number; // porcentaje
};

export default function GeneralStatusCard({ activa, reactiva, aparente, fp }: Props) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
        <Zap className="w-5 h-5 text-yellow-400" /> INDICATORS
      </h2>

      {/* 3 filas, 4 columnas */}
      <div className="grid grid-cols-4 gap-y-2 text-center">

        {/* ---------- TITULOS ---------- */}
        <p className="text-sm font-semibold text-muted-foreground">Active Power</p>
        <p className="text-sm font-semibold text-muted-foreground">Reactive Power</p>
        <p className="text-sm font-semibold text-muted-foreground">Apparent Power</p>
        <p className="text-sm font-semibold text-muted-foreground">Power Factor</p>

        {/* ---------- VALORES ---------- */}
        <h3 className="text-3xl font-bold text-foreground">{(activa ?? 0).toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-foreground">{(reactiva ?? 0).toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-foreground">{(aparente ?? 0).toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-foreground">{(fp ?? 0).toFixed(0)}%</h3>

        {/* ---------- UNIDADES ---------- */}
        <span className="text-sm font-medium text-muted-foreground/80">kW</span>
        <span className="text-sm font-medium text-muted-foreground/80">kVAr</span>
        <span className="text-sm font-medium text-muted-foreground/80">kVA</span>
        <span className="text-sm font-medium text-muted-foreground/80"> </span>
      </div>
    </>
  );
}
