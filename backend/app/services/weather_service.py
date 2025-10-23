"""
Weather Service - Integration with Open-Meteo API
"""
import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class WeatherService:
    """Service to fetch weather data from Open-Meteo API"""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

    @staticmethod
    async def get_current_weather(latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Get current weather for a location
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
            "timezone": "auto"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(WeatherService.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()

            return {
                "temperature": data["current"]["temperature_2m"],
                "humidity": data["current"]["relative_humidity_2m"],
                "precipitation": data["current"]["precipitation"],
                "wind_speed": data["current"]["wind_speed_10m"],
                "weather_code": data["current"]["weather_code"],
                "time": data["current"]["time"]
            }

    @staticmethod
    async def get_weather_forecast(
        latitude: float,
        longitude: float,
        days: int = 7
    ) -> Dict[str, Any]:
        """
        Get weather forecast for next N days
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
            "forecast_days": days,
            "timezone": "auto"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(WeatherService.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_historical_weather(
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """
        Get historical weather data
        Format: YYYY-MM-DD
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_mean,precipitation_sum",
            "timezone": "auto"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(WeatherService.ARCHIVE_URL, params=params)
            response.raise_for_status()
            data = response.json()

            # Calculate statistics
            temps = [t for t in data["daily"]["temperature_2m_mean"] if t is not None]
            precips = [p for p in data["daily"]["precipitation_sum"] if p is not None]

            temp_avg = sum(temps) / len(temps) if temps else 0
            precip_total = sum(precips) if precips else 0

            return {
                "temperature_avg": round(temp_avg, 1),
                "precipitation_total": round(precip_total, 1),
                "days": len(data["daily"]["time"]),
                "start_date": start_date,
                "end_date": end_date
            }

    @staticmethod
    def get_weather_description(code: int) -> str:
        """
        Get weather description from WMO weather code
        """
        weather_codes = {
            0: "Ciel dégagé",
            1: "Principalement dégagé",
            2: "Partiellement nuageux",
            3: "Couvert",
            45: "Brouillard",
            48: "Brouillard givrant",
            51: "Bruine légère",
            53: "Bruine modérée",
            55: "Bruine dense",
            61: "Pluie légère",
            63: "Pluie modérée",
            65: "Pluie forte",
            71: "Neige légère",
            73: "Neige modérée",
            75: "Neige forte",
            77: "Grains de neige",
            80: "Averses légères",
            81: "Averses modérées",
            82: "Averses violentes",
            85: "Averses de neige légères",
            86: "Averses de neige fortes",
            95: "Orage",
            96: "Orage avec grêle légère",
            99: "Orage avec grêle forte",
        }
        return weather_codes.get(code, "Inconnu")


weather_service = WeatherService()
