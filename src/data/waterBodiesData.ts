export interface WaterBodyData {
  id: string;
  name: string;
  region: string;
  surface: number;
  variation: number;
  ndwi: number;
  status: 'good' | 'warning' | 'critical';
  alerts: number;
  type: 'lake' | 'river' | 'reservoir' | 'wetland';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Données réelles des principaux plans d'eau du Burkina Faso
export const waterBodiesData: WaterBodyData[] = [
  {
    id: 'wb-001',
    name: 'Barrage de Bagré',
    region: 'Centre-Est',
    surface: 23500,
    variation: -2.8,
    ndwi: 0.42,
    status: 'warning',
    alerts: 2,
    type: 'reservoir',
    coordinates: { latitude: 11.4769, longitude: -0.5467 }
  },
  {
    id: 'wb-002',
    name: 'Barrage de Kompienga',
    region: 'Est',
    surface: 19400,
    variation: -1.5,
    ndwi: 0.38,
    status: 'good',
    alerts: 0,
    type: 'reservoir',
    coordinates: { latitude: 11.0821, longitude: 0.6998 }
  },
  {
    id: 'wb-003',
    name: 'Barrage de Sourou',
    region: 'Boucle du Mouhoun',
    surface: 15600,
    variation: -3.2,
    ndwi: 0.35,
    status: 'warning',
    alerts: 1,
    type: 'reservoir',
    coordinates: { latitude: 12.9333, longitude: -3.2167 }
  },
  {
    id: 'wb-004',
    name: 'Barrage de Samendeni',
    region: 'Hauts-Bassins',
    surface: 12800,
    variation: 1.2,
    ndwi: 0.44,
    status: 'good',
    alerts: 0,
    type: 'reservoir',
    coordinates: { latitude: 11.2167, longitude: -4.4667 }
  },
  {
    id: 'wb-005',
    name: 'Barrage de Loumbila',
    region: 'Plateau-Central',
    surface: 780,
    variation: -4.5,
    ndwi: 0.32,
    status: 'critical',
    alerts: 3,
    type: 'reservoir',
    coordinates: { latitude: 12.5015, longitude: -1.3690 }
  },
  {
    id: 'wb-006',
    name: 'Barrage de Ziga',
    region: 'Plateau-Central',
    surface: 2100,
    variation: -2.1,
    ndwi: 0.36,
    status: 'warning',
    alerts: 1,
    type: 'reservoir',
    coordinates: { latitude: 12.4833, longitude: -1.5333 }
  },
  {
    id: 'wb-007',
    name: 'Lac Bam',
    region: 'Centre-Nord',
    surface: 3200,
    variation: -5.8,
    ndwi: 0.28,
    status: 'critical',
    alerts: 4,
    type: 'lake',
    coordinates: { latitude: 13.3833, longitude: -1.5167 }
  },
  {
    id: 'wb-008',
    name: 'Mare aux hippopotames',
    region: 'Hauts-Bassins',
    surface: 1920,
    variation: 0.8,
    ndwi: 0.41,
    status: 'good',
    alerts: 0,
    type: 'wetland',
    coordinates: { latitude: 11.5167, longitude: -4.4167 }
  },
  {
    id: 'wb-009',
    name: 'Barrage de Moussodougou',
    region: 'Cascades',
    surface: 680,
    variation: 1.5,
    ndwi: 0.43,
    status: 'good',
    alerts: 0,
    type: 'reservoir',
    coordinates: { latitude: 10.4833, longitude: -4.8000 }
  },
  {
    id: 'wb-010',
    name: 'Barrage de Toécé',
    region: 'Sud-Ouest',
    surface: 520,
    variation: -1.8,
    ndwi: 0.37,
    status: 'good',
    alerts: 1,
    type: 'reservoir',
    coordinates: { latitude: 10.8500, longitude: -3.1833 }
  }
];
