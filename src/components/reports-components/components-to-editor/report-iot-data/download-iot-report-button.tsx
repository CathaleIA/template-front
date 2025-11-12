'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildIotReportHtml, fromRawSnapshot, type RawIotSnapshot } from './capture-data';

interface DownloadIotReportButtonProps {
  snapshot: RawIotSnapshot;
  fileName?: string;
  styles?: string;
}

export function DownloadIotReportButton({ snapshot, fileName, styles }: DownloadIotReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const report = fromRawSnapshot(snapshot);
      const html = buildIotReportHtml(report);
      const targetFileName = fileName ?? `reporte-iot-${report.device_id || 'sin-id'}.pdf`;
      const response = await fetch('/api/pdf-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          styles: styles ? `\n${styles}\n` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error generando el PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="custom" size="custom" onClick={handleDownload} disabled={isExporting}>
      {isExporting ? 'Generando PDF…' : 'Descargar reporte IoT'}
    </Button>
  );
}
