import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SatelliteRequest {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coordinates, startDate, endDate }: SatelliteRequest = await req.json();
    
    console.log('Fetching satellite data for:', { coordinates, startDate, endDate });

    // Pour l'instant, on génère des données simulées basées sur des patterns réalistes
    // Dans une version production, on pourrait utiliser:
    // - Sentinel Hub API (nécessite un compte et clé API)
    // - Google Earth Engine (nécessite authentification)
    // - NASA EARTHDATA (gratuit mais complexe)
    // - Copernicus Open Access Hub (gratuit, API complexe)
    
    const images = generateRealisticSatelliteData(startDate, endDate, coordinates);

    return new Response(
      JSON.stringify({ images }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in satellite-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateRealisticSatelliteData(
  startDate: string,
  endDate: string,
  coordinates: { latitude: number; longitude: number }
) {
  const images = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Sentinel-2 passe tous les 5 jours environ
  const sentinel2Interval = 5;
  // Landsat-8 passe tous les 16 jours
  const landsat8Interval = 16;
  
  let currentDate = new Date(start);
  let dayCounter = 0;
  
  // Générer des données pour la période
  while (currentDate <= end) {
    // Ajouter une image Sentinel-2 tous les 5 jours
    if (dayCounter % sentinel2Interval === 0) {
      // Simuler des variations saisonnières pour le Burkina Faso
      const month = currentDate.getMonth();
      const isRainySeason = month >= 5 && month <= 9; // Juin à Octobre
      
      // NDVI plus élevé en saison des pluies (végétation plus dense)
      const baseNDVI = isRainySeason ? 0.45 : 0.25;
      const ndviVariation = (Math.random() - 0.5) * 0.15;
      const ndvi = Math.max(-1, Math.min(1, baseNDVI + ndviVariation));
      
      // NDWI plus élevé en saison des pluies (plus d'eau)
      const baseNDWI = isRainySeason ? 0.35 : 0.15;
      const ndwiVariation = (Math.random() - 0.5) * 0.2;
      const ndwi = Math.max(-1, Math.min(1, baseNDWI + ndwiVariation));
      
      // Moins de nuages en saison sèche
      const baseCloudCoverage = isRainySeason ? 35 : 10;
      const cloudCoverage = Math.max(0, Math.min(100, baseCloudCoverage + (Math.random() - 0.5) * 30));
      
      images.push({
        date: currentDate.toISOString().split('T')[0],
        ndvi: Number(ndvi.toFixed(3)),
        ndwi: Number(ndwi.toFixed(3)),
        cloudCoverage: Number(cloudCoverage.toFixed(1)),
        resolution: '10m',
        source: 'Sentinel-2' as const,
        bands: ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
        processingLevel: 'L2A',
        sceneId: `S2_${currentDate.toISOString().split('T')[0]}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    // Ajouter une image Landsat-8 tous les 16 jours
    if (dayCounter % landsat8Interval === 0) {
      const month = currentDate.getMonth();
      const isRainySeason = month >= 5 && month <= 9;
      
      const baseNDVI = isRainySeason ? 0.42 : 0.23;
      const ndviVariation = (Math.random() - 0.5) * 0.12;
      const ndvi = Math.max(-1, Math.min(1, baseNDVI + ndviVariation));
      
      const baseNDWI = isRainySeason ? 0.32 : 0.12;
      const ndwiVariation = (Math.random() - 0.5) * 0.18;
      const ndwi = Math.max(-1, Math.min(1, baseNDWI + ndwiVariation));
      
      const baseCloudCoverage = isRainySeason ? 32 : 8;
      const cloudCoverage = Math.max(0, Math.min(100, baseCloudCoverage + (Math.random() - 0.5) * 25));
      
      images.push({
        date: currentDate.toISOString().split('T')[0],
        ndvi: Number(ndvi.toFixed(3)),
        ndwi: Number(ndwi.toFixed(3)),
        cloudCoverage: Number(cloudCoverage.toFixed(1)),
        resolution: '30m',
        source: 'Landsat-8' as const,
        bands: ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
        processingLevel: 'L2',
        sceneId: `L8_${currentDate.toISOString().split('T')[0]}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayCounter++;
  }
  
  // Trier par date décroissante
  return images.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}