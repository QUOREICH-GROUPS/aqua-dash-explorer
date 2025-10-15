import { WaterBodyData } from '@/data/waterBodiesData';

export const exportToCSV = (data: WaterBodyData[], filename: string = 'water-bodies-data.csv') => {
  const headers = ['ID', 'Nom', 'Région', 'Surface (ha)', 'Variation (%)', 'NDWI', 'Statut', 'Alertes', 'Type'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      `"${row.name}"`,
      row.region,
      row.surface,
      row.variation,
      row.ndwi,
      row.status,
      row.alerts,
      row.type
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToExcel = (data: WaterBodyData[], filename: string = 'water-bodies-data.xlsx') => {
  // Simple Excel export using HTML table method
  const headers = ['ID', 'Nom', 'Région', 'Surface (ha)', 'Variation (%)', 'NDWI', 'Statut', 'Alertes', 'Type'];
  
  const tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8"></head>
    <body>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.id}</td>
              <td>${row.name}</td>
              <td>${row.region}</td>
              <td>${row.surface}</td>
              <td>${row.variation}</td>
              <td>${row.ndwi}</td>
              <td>${row.status}</td>
              <td>${row.alerts}</td>
              <td>${row.type}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const generateShareableLink = (params: {
  region?: string;
  period?: string;
  waterBodyType?: string;
  selectedWaterBodyId?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params.region && params.region !== 'all') {
    searchParams.set('region', params.region);
  }
  if (params.period && params.period !== 'current') {
    searchParams.set('period', params.period);
  }
  if (params.waterBodyType && params.waterBodyType !== 'all') {
    searchParams.set('type', params.waterBodyType);
  }
  if (params.selectedWaterBodyId) {
    searchParams.set('selected', params.selectedWaterBodyId);
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const queryString = searchParams.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};
