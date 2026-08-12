import type { PageLoad } from './$types';
import { decodeReport, type ReportPayload } from '$lib/shareReport';

export const load: PageLoad = ({ url }) => {
  const d = url.searchParams.get('d');
  const report: ReportPayload | null = d ? decodeReport(d) : null;
  return { report };
};
