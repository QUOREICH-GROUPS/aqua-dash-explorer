export interface WaterBodyData {
  id: string;
  name: string;
  region: string;
  surface: number;
  variation: number;
  ndwi: number;
  status: 'normal' | 'warning' | 'critical';
  alerts: number;
  type: 'lake' | 'river' | 'reservoir' | 'wetland';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const waterBodiesData: WaterBodyData[] = [
  {
    id: 'wb-001',
    name: 'Lac de Serre-Ponçon',
    region: 'sud',
    surface: 2850,
    variation: -5.2,
    ndwi: 0.68,
    status: 'warning',
    alerts: 2,
    type: 'reservoir',
    coordinates: { latitude: 44.4833, longitude: 6.3167 }
  },
  {
    id: 'wb-002',
    name: 'Étang de Berre',
    region: 'sud',
    surface: 15500,
    variation: -12.8,
    ndwi: 0.55,
    status: 'critical',
    alerts: 5,
    type: 'lake',
    coordinates: { latitude: 43.4500, longitude: 5.1333 }
  },
  {
    id: 'wb-003',
    name: 'Lac du Bourget',
    region: 'est',
    surface: 4460,
    variation: 2.1,
    ndwi: 0.72,
    status: 'normal',
    alerts: 0,
    type: 'lake',
    coordinates: { latitude: 45.7333, longitude: 5.8667 }
  },
  {
    id: 'wb-004',
    name: 'Lac Léman',
    region: 'est',
    surface: 58200,
    variation: -1.5,
    ndwi: 0.75,
    status: 'normal',
    alerts: 1,
    type: 'lake',
    coordinates: { latitude: 46.4547, longitude: 6.5397 }
  },
  {
    id: 'wb-005',
    name: 'Étang de Thau',
    region: 'sud',
    surface: 7500,
    variation: -8.3,
    ndwi: 0.61,
    status: 'warning',
    alerts: 3,
    type: 'wetland',
    coordinates: { latitude: 43.4167, longitude: 3.6000 }
  },
  {
    id: 'wb-006',
    name: 'Lac d\'Annecy',
    region: 'est',
    surface: 2750,
    variation: 1.8,
    ndwi: 0.78,
    status: 'normal',
    alerts: 0,
    type: 'lake',
    coordinates: { latitude: 45.8631, longitude: 6.1683 }
  },
  {
    id: 'wb-007',
    name: 'Lac de Pareloup',
    region: 'sud',
    surface: 1290,
    variation: -15.2,
    ndwi: 0.52,
    status: 'critical',
    alerts: 4,
    type: 'reservoir',
    coordinates: { latitude: 44.2500, longitude: 2.7500 }
  },
  {
    id: 'wb-008',
    name: 'Seine (Paris)',
    region: 'centre',
    surface: 890,
    variation: -3.1,
    ndwi: 0.65,
    status: 'normal',
    alerts: 1,
    type: 'river',
    coordinates: { latitude: 48.8566, longitude: 2.3522 }
  },
  {
    id: 'wb-009',
    name: 'Loire (Orléans)',
    region: 'centre',
    surface: 1250,
    variation: -7.5,
    ndwi: 0.58,
    status: 'warning',
    alerts: 2,
    type: 'river',
    coordinates: { latitude: 47.9028, longitude: 1.9086 }
  },
  {
    id: 'wb-010',
    name: 'Lac de Vassivière',
    region: 'ouest',
    surface: 1060,
    variation: 0.5,
    ndwi: 0.70,
    status: 'normal',
    alerts: 0,
    type: 'reservoir',
    coordinates: { latitude: 45.8333, longitude: 1.8833 }
  }
];
