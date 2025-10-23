"""
CRUD operations for Water Measurement
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.models.water_measurement import WaterMeasurement
from app.schemas.water_measurement import WaterMeasurementCreate


class CRUDWaterMeasurement:
    """CRUD operations for water measurements"""

    def get(self, db: Session, id: UUID) -> Optional[WaterMeasurement]:
        """Get measurement by ID"""
        return db.query(WaterMeasurement).filter(WaterMeasurement.id == id).first()

    def get_by_water_body(
        self,
        db: Session,
        water_body_id: UUID,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[WaterMeasurement]:
        """Get measurements for a specific water body"""
        query = db.query(WaterMeasurement).filter(
            WaterMeasurement.water_body_id == water_body_id
        )

        if start_date:
            query = query.filter(WaterMeasurement.measurement_date >= start_date)

        if end_date:
            query = query.filter(WaterMeasurement.measurement_date <= end_date)

        return query.order_by(WaterMeasurement.measurement_date.desc()).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: WaterMeasurementCreate) -> WaterMeasurement:
        """Create new measurement"""
        db_obj = WaterMeasurement(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def count_by_water_body(self, db: Session, water_body_id: UUID) -> int:
        """Count measurements for a water body"""
        return db.query(func.count(WaterMeasurement.id)).filter(
            WaterMeasurement.water_body_id == water_body_id
        ).scalar()


crud_water_measurement = CRUDWaterMeasurement()
