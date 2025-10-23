"""
Analysis Endpoints - Combine water body data with weather and agriculture
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_db
from app.crud.crud_water_body import crud_water_body
from app.services.weather_service import weather_service
from shapely import wkb
from geoalchemy2.shape import to_shape


router = APIRouter()


@router.get("/{water_body_id}/current")
async def get_current_analysis(
    water_body_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get current analysis for a water body including weather data
    """
    # Get water body
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")

    # Extract coordinates from centroid
    if not water_body.centroid:
        raise HTTPException(status_code=400, detail="Water body has no centroid")

    try:
        # Convert WKBElement to shapely geometry
        geom = to_shape(water_body.centroid)
        longitude, latitude = geom.x, geom.y
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting coordinates: {str(e)}")

    # Get current weather
    try:
        weather = await weather_service.get_current_weather(latitude, longitude)
        weather["description"] = weather_service.get_weather_description(weather["weather_code"])
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")

    return {
        "water_body": {
            "id": str(water_body.id),
            "name": water_body.name,
            "region": water_body.region,
            "type": water_body.type,
            "surface_area_ha": float(water_body.surface_area_ha) if water_body.surface_area_ha else None,
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "metadata": water_body.extra_data if isinstance(water_body.extra_data, dict) else {},
        },
        "weather": weather,
        "analysis": {
            "risk_level": _calculate_risk_level(water_body, weather),
            "recommendations": _generate_recommendations(water_body, weather),
        }
    }


@router.get("/{water_body_id}/forecast")
async def get_weather_forecast_analysis(
    water_body_id: UUID,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get weather forecast analysis for a water body
    """
    # Get water body
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")

    # Extract coordinates
    if not water_body.centroid:
        raise HTTPException(status_code=400, detail="Water body has no centroid")

    try:
        geom = to_shape(water_body.centroid)
        longitude, latitude = geom.x, geom.y
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting coordinates: {str(e)}")

    # Get weather forecast
    try:
        forecast = await weather_service.get_weather_forecast(latitude, longitude, days)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")

    return {
        "water_body_id": str(water_body_id),
        "water_body_name": water_body.name,
        "forecast": forecast,
        "summary": {
            "total_precipitation_expected": sum(forecast["daily"]["precipitation_sum"]),
            "max_temperature": max(forecast["daily"]["temperature_2m_max"]),
            "min_temperature": min(forecast["daily"]["temperature_2m_min"]),
            "days_with_rain": sum(1 for p in forecast["daily"]["precipitation_sum"] if p > 0),
        }
    }


@router.get("/{water_body_id}/historical")
async def get_historical_analysis(
    water_body_id: UUID,
    days_back: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get historical weather analysis for a water body
    """
    # Get water body
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")

    # Extract coordinates
    if not water_body.centroid:
        raise HTTPException(status_code=400, detail="Water body has no centroid")

    try:
        geom = to_shape(water_body.centroid)
        longitude, latitude = geom.x, geom.y
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting coordinates: {str(e)}")

    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days_back)

    # Get historical weather
    try:
        historical = await weather_service.get_historical_weather(
            latitude,
            longitude,
            start_date.isoformat(),
            end_date.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")

    return {
        "water_body_id": str(water_body_id),
        "water_body_name": water_body.name,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days_back
        },
        "weather_summary": historical,
    }


def _calculate_risk_level(water_body, weather: dict) -> str:
    """
    Calculate risk level based on water body status and weather
    """
    metadata = water_body.extra_data if isinstance(water_body.extra_data, dict) else {}
    status = metadata.get("status", "normal")
    variation = metadata.get("variation", 0)
    precipitation = weather.get("precipitation", 0)

    # High risk conditions
    if status == "critical" or variation < -15:
        return "high"

    # Medium risk
    if status == "warning" or (variation < -5 and precipitation < 1):
        return "medium"

    return "low"


def _generate_recommendations(water_body, weather: dict) -> List[str]:
    """
    Generate recommendations based on analysis
    """
    recommendations = []
    metadata = water_body.extra_data if isinstance(water_body.extra_data, dict) else {}
    variation = metadata.get("variation", 0)
    precipitation = weather.get("precipitation", 0)
    temperature = weather.get("temperature", 25)

    # Water level recommendations
    if variation < -10:
        recommendations.append("Niveau d'eau en baisse significative - surveillance accrue recommandée")

    if variation < -5 and precipitation < 1:
        recommendations.append("Faible précipitation et baisse du niveau - risque de stress hydrique")

    # Temperature recommendations
    if temperature > 35:
        recommendations.append("Température élevée - risque d'évaporation accru")

    # Precipitation recommendations
    if precipitation > 50:
        recommendations.append("Précipitations importantes - surveiller les débordements potentiels")

    if not recommendations:
        recommendations.append("Conditions normales - maintenir la surveillance régulière")

    return recommendations
