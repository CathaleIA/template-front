// industrial-iot-lab/dashboard-industrial/src/components/HeaderStatus.tsx
'use client';
import React from 'react';

type Props = {
  subtitle?: string;
  lastUpdate: Date | null;
};

export default function HeaderStatus({subtitle, lastUpdate }: Props) {
  return (
    <div className="text-center mb-6" style={{ paddingTop: "0px" }}>
      {subtitle && <p className="text-black font-medium">{subtitle}</p>}
      <p className="text-sm text-black/80">
        última actualización {lastUpdate?.toLocaleTimeString('en-US')}
      </p>
    </div>
  );
}