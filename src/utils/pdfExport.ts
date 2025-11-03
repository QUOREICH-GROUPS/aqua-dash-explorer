import { WaterAnalysisResult } from '@/hooks/useWaterAnalysis';

interface ExportData {
  analysis: WaterAnalysisResult;
  region: string;
  timestamp: Date;
  mapScreenshot?: string;
}

export const exportToPDF = async (data: ExportData): Promise<void> => {
  // Créer le contenu HTML pour le PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport d'Analyse - ${data.region}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          background: linear-gradient(135deg, #0086c9 0%, #40c9c9 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .header .meta {
          opacity: 0.9;
          font-size: 14px;
        }
        
        .section {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .section h2 {
          color: #0086c9;
          font-size: 20px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #40c9c9;
        }
        
        .metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        
        .metric-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0086c9;
        }
        
        .metric-card .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .metric-card .value {
          font-size: 28px;
          font-weight: bold;
          color: #0f172a;
        }
        
        .metric-card .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        
        .alert-item, .anomaly-item {
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 6px;
          border-left: 4px solid;
        }
        
        .alert-item.high, .anomaly-item.high {
          background: #fee2e2;
          border-left-color: #dc2626;
        }
        
        .alert-item.medium, .anomaly-item.medium {
          background: #fef3c7;
          border-left-color: #f59e0b;
        }
        
        .alert-item.low, .anomaly-item.low {
          background: #dbeafe;
          border-left-color: #3b82f6;
        }
        
        .alert-item .title, .anomaly-item .title {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .alert-item .description, .anomaly-item .description {
          font-size: 14px;
          color: #64748b;
        }
        
        .suggestions {
          list-style: none;
          padding: 0;
        }
        
        .suggestions li {
          padding: 12px;
          margin-bottom: 8px;
          background: #f1f5f9;
          border-radius: 6px;
          position: relative;
          padding-left: 30px;
        }
        
        .suggestions li:before {
          content: '💡';
          position: absolute;
          left: 10px;
          top: 12px;
        }
        
        .forecast-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .forecast-table th {
          background: #0086c9;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        
        .forecast-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .forecast-table tr:nth-child(even) {
          background: #f8fafc;
        }
        
        .map-preview {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
          margin-top: 15px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e5e5;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        
        @media print {
          body { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport d'Analyse des Plans d'Eau</h1>
        <div class="meta">
          <div>Région: ${data.region}</div>
          <div>Date: ${new Date(data.timestamp).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
      </div>

      ${data.mapScreenshot ? `
      <div class="section">
        <h2>Aperçu de la carte</h2>
        <img src="${data.mapScreenshot}" alt="Carte" class="map-preview" />
      </div>
      ` : ''}

      <div class="section">
        <h2>Métriques principales</h2>
        <div class="metrics">
          <div class="metric-card">
            <div class="label">Surface totale</div>
            <div class="value">${data.analysis.surface.value} ${data.analysis.surface.unit}</div>
            <span class="badge ${data.analysis.surface.variation >= 0 ? 'badge-success' : 'badge-danger'}">
              ${data.analysis.surface.variation > 0 ? '+' : ''}${data.analysis.surface.variation}%
            </span>
          </div>
          <div class="metric-card">
            <div class="label">NDWI moyen</div>
            <div class="value">${data.analysis.ndwi.average.toFixed(2)}</div>
            <span class="badge badge-info">
              Tendance: ${
                data.analysis.ndwi.trend === 'stable' ? 'Stable' : 
                data.analysis.ndwi.trend === 'increasing' ? 'Croissante' : 
                'Décroissante'
              }
            </span>
          </div>
        </div>
      </div>

      ${data.analysis.alerts.length > 0 ? `
      <div class="section">
        <h2>Alertes (${data.analysis.alerts.length})</h2>
        ${data.analysis.alerts.map(alert => `
          <div class="alert-item ${alert.priority}">
            <div class="title">${alert.type}</div>
            <div class="description">${alert.message}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.analysis.anomalies.length > 0 ? `
      <div class="section">
        <h2>Anomalies détectées (${data.analysis.anomalies.length})</h2>
        ${data.analysis.anomalies.map(anomaly => `
          <div class="anomaly-item ${anomaly.severity}">
            <div class="title">${anomaly.type}</div>
            <div class="description">${anomaly.description}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.analysis.suggestions.length > 0 ? `
      <div class="section">
        <h2>Recommandations</h2>
        <ul class="suggestions">
          ${data.analysis.suggestions.map(suggestion => `
            <li>${suggestion}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="section">
        <h2>Prévisions (7 jours)</h2>
        <table class="forecast-table">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Surface prévue</th>
              <th>Confiance</th>
            </tr>
          </thead>
          <tbody>
            ${data.analysis.forecast.map(f => `
              <tr>
                <td>Jour ${f.day}</td>
                <td>${f.predictedSurface.toFixed(2)} ha</td>
                <td>${(f.confidence * 100).toFixed(0)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Rapport généré automatiquement par le système de surveillance des plans d'eau</p>
        <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;

  // Créer un blob et déclencher le téléchargement
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analyse-${data.region}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};