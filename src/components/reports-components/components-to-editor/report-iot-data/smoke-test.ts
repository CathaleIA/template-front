import sampleSnapshot from './sample-snapshot.json';
import { buildIotReportHtml, fromRawSnapshot } from './capture-data';

const normalized = fromRawSnapshot(sampleSnapshot);

console.dir(normalized, { depth: null });

const html = buildIotReportHtml(normalized);

console.log('\n================ HTML OUTPUT ================\n');
console.log(html);
