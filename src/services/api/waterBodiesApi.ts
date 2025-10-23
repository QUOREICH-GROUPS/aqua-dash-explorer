/**
 * Water Bodies API Service
 * Handles all API calls related to water bodies
 */
import { apiClient } from './config';

/**
 * Water Body Interface (matches backend schema)
 */
export interface WaterBody {
  id: string;
  name: string;
  region: string;
  type: 'lake' | 'river' | 'reservoir' | 'wetland';
  surface_area_ha: number;
  centroid?: {
    type: string;
    coordinates: [number, number];
  };
  metadata: {
    status?: 'good' | 'warning' | 'critical';
    alerts?: number;
    variation?: number;
    ndwi?: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Water Body List Response
 */
export interface WaterBodyListResponse {
  total: number;
  items: WaterBody[];
}

/**
 * Water Measurement Interface
 */
export interface WaterMeasurement {
  id: string;
  water_body_id: string;
  measurement_date: string;
  surface_area_ha?: number;
  ndwi_average?: number;
  ndwi_min?: number;
  ndwi_max?: number;
  water_level_m?: number;
  temperature_c?: number;
  source: string;
  confidence_score?: number;
  created_at: string;
}

/**
 * Water Measurements List Response
 */
export interface WaterMeasurementListResponse {
  total: number;
  items: WaterMeasurement[];
}

/**
 * Water Body Statistics
 */
export interface WaterBodyStats {
  water_body: WaterBody;
  stats: {
    total_measurements: number;
    avg_surface_area?: number;
    avg_ndwi?: number;
    last_measurement_date?: string;
    surface_trend?: 'increasing' | 'decreasing' | 'stable';
  };
}

/**
 * Query Parameters for fetching water bodies
 */
export interface WaterBodiesQueryParams {
  skip?: number;
  limit?: number;
  region?: string;
  type?: string;
}

/**
 * Query Parameters for fetching measurements
 */
export interface MeasurementsQueryParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Water Bodies API
 */
export const waterBodiesApi = {
  /**
   * Get all water bodies with optional filters
   */
  getAll: async (params?: WaterBodiesQueryParams): Promise<WaterBodyListResponse> => {
    const response = await apiClient.get<WaterBodyListResponse>('/api/v1/water-bodies/', {
      params,
    });
    return response.data;
  },

  /**
   * Get single water body by ID
   */
  getById: async (id: string): Promise<WaterBody> => {
    const response = await apiClient.get<WaterBody>(`/api/v1/water-bodies/${id}`);
    return response.data;
  },

  /**
   * Create new water body
   */
  create: async (data: Partial<WaterBody>): Promise<WaterBody> => {
    const response = await apiClient.post<WaterBody>('/api/v1/water-bodies/', data);
    return response.data;
  },

  /**
   * Update existing water body
   */
  update: async (id: string, data: Partial<WaterBody>): Promise<WaterBody> => {
    const response = await apiClient.patch<WaterBody>(`/api/v1/water-bodies/${id}`, data);
    return response.data;
  },

  /**
   * Delete water body
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/water-bodies/${id}`);
  },

  /**
   * Get measurements for a water body
   */
  getMeasurements: async (
    id: string,
    params?: MeasurementsQueryParams
  ): Promise<WaterMeasurementListResponse> => {
    const response = await apiClient.get<WaterMeasurementListResponse>(
      `/api/v1/water-bodies/${id}/measurements`,
      { params }
    );
    return response.data;
  },

  /**
   * Get statistics for a water body
   */
  getStats: async (id: string): Promise<WaterBodyStats> => {
    const response = await apiClient.get<WaterBodyStats>(
      `/api/v1/water-bodies/${id}/stats`
    );
    return response.data;
  },
};
