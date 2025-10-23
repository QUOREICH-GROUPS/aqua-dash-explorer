/**
 * React Query Hooks for Water Bodies API
 * Provides data fetching, caching, and state management for water bodies
 */
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  waterBodiesApi,
  WaterBody,
  WaterBodyListResponse,
  WaterMeasurementListResponse,
  WaterBodyStats,
  getApiErrorMessage,
} from '@/services/api';

/**
 * Query keys for React Query cache management
 */
export const waterBodyKeys = {
  all: ['waterBodies'] as const,
  lists: () => [...waterBodyKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...waterBodyKeys.lists(), filters] as const,
  details: () => [...waterBodyKeys.all, 'detail'] as const,
  detail: (id: string) => [...waterBodyKeys.details(), id] as const,
  measurements: (id: string) => [...waterBodyKeys.detail(id), 'measurements'] as const,
  stats: (id: string) => [...waterBodyKeys.detail(id), 'stats'] as const,
};

/**
 * Hook to fetch all water bodies with filters
 */
export function useWaterBodies(filters?: {
  region?: string;
  type?: string;
  skip?: number;
  limit?: number;
}): UseQueryResult<WaterBodyListResponse, Error> {
  return useQuery({
    queryKey: waterBodyKeys.list(filters),
    queryFn: () => waterBodiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch a single water body
 */
export function useWaterBody(id: string): UseQueryResult<WaterBody, Error> {
  return useQuery({
    queryKey: waterBodyKeys.detail(id),
    queryFn: () => waterBodiesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch water body measurements
 */
export function useWaterBodyMeasurements(
  id: string,
  params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }
): UseQueryResult<WaterMeasurementListResponse, Error> {
  return useQuery({
    queryKey: waterBodyKeys.measurements(id),
    queryFn: () => waterBodiesApi.getMeasurements(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch water body statistics
 */
export function useWaterBodyStats(id: string): UseQueryResult<WaterBodyStats, Error> {
  return useQuery({
    queryKey: waterBodyKeys.stats(id),
    queryFn: () => waterBodiesApi.getStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new water body
 */
export function useCreateWaterBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WaterBody>) => waterBodiesApi.create(data),
    onSuccess: (data) => {
      // Invalidate and refetch water bodies list
      queryClient.invalidateQueries({ queryKey: waterBodyKeys.lists() });

      toast.success('Water body created successfully', {
        description: `${data.name} has been added`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create water body', {
        description: getApiErrorMessage(error),
      });
    },
  });
}

/**
 * Hook to update a water body
 */
export function useUpdateWaterBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WaterBody> }) =>
      waterBodiesApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific water body and list
      queryClient.invalidateQueries({ queryKey: waterBodyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: waterBodyKeys.lists() });

      toast.success('Water body updated successfully', {
        description: `${data.name} has been updated`,
      });
    },
    onError: (error) => {
      toast.error('Failed to update water body', {
        description: getApiErrorMessage(error),
      });
    },
  });
}

/**
 * Hook to delete a water body
 */
export function useDeleteWaterBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => waterBodiesApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: waterBodyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: waterBodyKeys.lists() });

      toast.success('Water body deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete water body', {
        description: getApiErrorMessage(error),
      });
    },
  });
}
