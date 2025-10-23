"""
Water Bodies API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.crud.crud_water_body import crud_water_body
from app.crud.crud_water_measurement import crud_water_measurement
from app.schemas.water_body import (
    WaterBody,
    WaterBodyList,
    WaterBodyCreate,
    WaterBodyUpdate,
)
from app.schemas.water_measurement import WaterMeasurementList

router = APIRouter()


@router.get("/", response_model=WaterBodyList)
def get_water_bodies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    region: Optional[str] = Query(None, description="Filter by region"),
    type: Optional[str] = Query(None, description="Filter by water body type"),
    db: Session = Depends(get_db)
):
    """
    Get all water bodies with optional filters

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **region**: Filter by region (e.g., 'Centre-Est', 'Plateau-Central')
    - **type**: Filter by type (lake, river, reservoir, wetland)
    """
    items = crud_water_body.get_multi(
        db,
        skip=skip,
        limit=limit,
        region=region,
        water_type=type
    )
    total = crud_water_body.count(db, region=region, water_type=type)

    return {"total": total, "items": items}


@router.get("/{water_body_id}", response_model=WaterBody)
def get_water_body(
    water_body_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get specific water body by ID

    Returns detailed information about a single water body including metadata
    """
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")
    return water_body


@router.post("/", response_model=WaterBody, status_code=201)
def create_water_body(
    water_body_in: WaterBodyCreate,
    db: Session = Depends(get_db)
):
    """
    Create new water body

    Requires:
    - name: Water body name
    - region: Geographic region
    - type: One of (lake, river, reservoir, wetland)
    - geometry: Optional GeoJSON polygon
    """
    return crud_water_body.create(db, obj_in=water_body_in)


@router.patch("/{water_body_id}", response_model=WaterBody)
def update_water_body(
    water_body_id: UUID,
    water_body_in: WaterBodyUpdate,
    db: Session = Depends(get_db)
):
    """
    Update existing water body

    All fields are optional. Only provided fields will be updated.
    """
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")

    return crud_water_body.update(db, db_obj=water_body, obj_in=water_body_in)


@router.delete("/{water_body_id}", status_code=204)
def delete_water_body(
    water_body_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete water body

    This will also delete all associated measurements (CASCADE)
    """
    success = crud_water_body.delete(db, id=water_body_id)
    if not success:
        raise HTTPException(status_code=404, detail="Water body not found")
    return None


@router.get("/{water_body_id}/measurements", response_model=WaterMeasurementList)
def get_water_body_measurements(
    water_body_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Get measurements for a specific water body

    Returns time series data for surface area, NDWI, water level, etc.
    """
    # Verify water body exists
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")

    # Parse dates if provided
    from datetime import datetime
    start_date_obj = datetime.fromisoformat(start_date).date() if start_date else None
    end_date_obj = datetime.fromisoformat(end_date).date() if end_date else None

    items = crud_water_measurement.get_by_water_body(
        db,
        water_body_id=water_body_id,
        skip=skip,
        limit=limit,
        start_date=start_date_obj,
        end_date=end_date_obj,
    )
    total = crud_water_measurement.count_by_water_body(db, water_body_id=water_body_id)

    return {"total": total, "items": items}


@router.get("/{water_body_id}/stats")
def get_water_body_stats(
    water_body_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get statistics for a water body

    Returns aggregated statistics including:
    - Total measurements
    - Average surface area
    - Average NDWI
    - Last measurement date
    - Surface area trend (increasing/decreasing/stable)
    """
    result = crud_water_body.get_with_stats(db, id=water_body_id)
    if not result:
        raise HTTPException(status_code=404, detail="Water body not found")

    return result
