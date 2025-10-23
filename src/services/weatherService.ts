/**
 * Weather Service - Open-Meteo API Integration
 * Free weather API without API key requirement
 */

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
}

export interface WeatherForecast {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

export interface HistoricalWeatherData {
  temperature_avg: number;
  precipitation_total: number;
  days: number;
}

/**
 * Fetch current weather for a location
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.current.temperature_2m,
      precipitation: data.current.precipitation,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Fetch weather forecast for next 7 days
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  days: number = 7
): Promise<WeatherForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&forecast_days=${days}&timezone=auto`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

/**
 * Fetch historical weather data for analysis
 */
export async function getHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<HistoricalWeatherData> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,precipitation_sum&timezone=auto`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Calculate averages
    const temps = data.daily.temperature_2m_mean.filter((t: number) => t !== null);
    const precips = data.daily.precipitation_sum.filter((p: number) => p !== null);

    const temperature_avg = temps.length > 0
      ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length
      : 0;

    const precipitation_total = precips.length > 0
      ? precips.reduce((a: number, b: number) => a + b, 0)
      : 0;

    return {
      temperature_avg,
      precipitation_total,
      days: data.daily.time.length,
    };
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
}

/**
 * Get weather description from WMO weather code
 * https://open-meteo.com/en/docs
 */
export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Ciel dégagé',
    1: 'Principalement dégagé',
    2: 'Partiellement nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine modérée',
    55: 'Bruine dense',
    61: 'Pluie légère',
    63: 'Pluie modérée',
    65: 'Pluie forte',
    71: 'Neige légère',
    73: 'Neige modérée',
    75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses légères',
    81: 'Averses modérées',
    82: 'Averses violentes',
    85: 'Averses de neige légères',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grêle légère',
    99: 'Orage avec grêle forte',
  };

  return weatherCodes[code] || 'Inconnu';
}

/**
 * Get weather icon based on WMO code
 */
export function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}
