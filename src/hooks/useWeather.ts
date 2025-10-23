/**
 * React Query hooks for weather data
 */
import { useQuery } from '@tanstack/react-query';
import {
  getCurrentWeather,
  getWeatherForecast,
  getHistoricalWeather,
  type WeatherData,
  type WeatherForecast,
  type HistoricalWeatherData,
} from '@/services/weatherService';

/**
 * Hook to fetch current weather for a location
 */
export function useCurrentWeather(latitude?: number, longitude?: number) {
  return useQuery<WeatherData>({
    queryKey: ['weather', 'current', latitude, longitude],
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }
      return getCurrentWeather(latitude, longitude);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch weather forecast
 */
export function useWeatherForecast(
  latitude?: number,
  longitude?: number,
  days: number = 7
) {
  return useQuery<WeatherForecast>({
    queryKey: ['weather', 'forecast', latitude, longitude, days],
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }
      return getWeatherForecast(latitude, longitude, days);
    },
    enabled: !!latitude && !!longitude,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch historical weather data
 */
export function useHistoricalWeather(
  latitude?: number,
  longitude?: number,
  startDate?: string,
  endDate?: string
) {
  return useQuery<HistoricalWeatherData>({
    queryKey: ['weather', 'historical', latitude, longitude, startDate, endDate],
    queryFn: () => {
      if (!latitude || !longitude || !startDate || !endDate) {
        throw new Error('All parameters are required');
      }
      return getHistoricalWeather(latitude, longitude, startDate, endDate);
    },
    enabled: !!latitude && !!longitude && !!startDate && !!endDate,
    staleTime: 60 * 60 * 1000, // 1 hour (historical data doesn't change)
    retry: 2,
  });
}
