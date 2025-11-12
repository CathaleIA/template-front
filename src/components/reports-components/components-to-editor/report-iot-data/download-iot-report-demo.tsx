'use client';

import sampleSnapshot from './sample-snapshot.json';
import { DownloadIotReportButton } from './download-iot-report-button';

export function DownloadIotReportDemo() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-sm text-slate-600">
        Demo temporal: usa datos de muestra para probar la descarga de PDF.
      </p>
      <DownloadIotReportButton snapshot={sampleSnapshot} />
    </div>
  );
}
