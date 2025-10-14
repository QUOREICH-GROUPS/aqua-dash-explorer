export interface WaterBodyData {
  id: string;
  name: string;
  region: string;
  surface: number;
  variation: number;
  ndwi: number;
  status: 'Excellent' | 'Bon' | 'Moyen' | 'Faible' | 'Critique';
  alerts: number;
}

export const exportToCSV = (data: WaterBodyData[], filename: string = 'plans_eau') => {
  const headers = ['Nom', 'Région', 'Surface (ha)', 'Variation (%)', 'NDWI', 'Statut', 'Alertes'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.name}"`,
      `"${row.region}"`,
      row.surface,
      row.variation,
      row.ndwi,
      `"${row.status}"`,
      row.alerts
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportToExcel = (data: WaterBodyData[], filename: string = 'plans_eau') => {
  // Simple Excel-compatible format (tab-separated)
  const headers = ['Nom', 'Région', 'Surface (ha)', 'Variation (%)', 'NDWI', 'Statut', 'Alertes'];
  const excelContent = [
    headers.join('\t'),
    ...data.map(row => [
      row.name,
      row.region,
      row.surface,
      row.variation,
      row.ndwi,
      row.status,
      row.alerts
    ].join('\t'))
  ].join('\n');

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
};
