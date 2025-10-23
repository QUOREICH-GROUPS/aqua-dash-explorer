"""
CRUD operations for Water Body
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional
from uuid import UUID
import json

from app.models.water_body import WaterBody
from app.schemas.water_body import WaterBodyCreate, WaterBodyUpdate


class CRUDWaterBody:
    """CRUD operations for water bodies"""

    def get(self, db: Session, id: UUID) -> Optional[WaterBody]:
        """Get water body by ID"""
        return db.query(WaterBody).filter(WaterBody.id == id).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        region: Optional[str] = None,
        water_type: Optional[str] = None,
    ) -> List[WaterBody]:
        """Get multiple water bodies with filters"""
        query = db.query(WaterBody)

        if region and region != "all":
            query = query.filter(WaterBody.region == region)

        if water_type and water_type != "all":
            query = query.filter(WaterBody.type == water_type)

        return query.order_by(WaterBody.surface_area_ha.desc()).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: WaterBodyCreate) -> WaterBody:
        """Create new water body"""
        db_obj = WaterBody(
            name=obj_in.name,
            region=obj_in.region,
            type=obj_in.type,
            surface_area_ha=obj_in.surface_area_ha,
            extra_data=obj_in.extra_data or {},
        )

        if obj_in.geometry:
            # Convert GeoJSON to PostGIS geometry
            geom_json = json.dumps(obj_in.geometry)
            db_obj.geometry = func.ST_GeomFromGeoJSON(geom_json)
            db_obj.centroid = func.ST_Centroid(db_obj.geometry)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        db_obj: WaterBody,
        obj_in: WaterBodyUpdate,
    ) -> WaterBody:
        """Update water body"""
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: UUID) -> bool:
        """Delete water body"""
        obj = self.get(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False

    def count(self, db: Session, region: Optional[str] = None, water_type: Optional[str] = None) -> int:
        """Count water bodies"""
        query = db.query(func.count(WaterBody.id))

        if region and region != "all":
            query = query.filter(WaterBody.region == region)

        if water_type and water_type != "all":
            query = query.filter(WaterBody.type == water_type)

        return query.scalar()

    def get_with_stats(self, db: Session, id: UUID) -> Optional[dict]:
        """Get water body with statistics using the database function"""
        result = db.execute(
            text("SELECT * FROM get_water_body_stats(:water_body_id)"),
            {"water_body_id": str(id)}
        ).first()

        if not result:
            return None

        water_body = self.get(db, id=id)
        if not water_body:
            return None

        return {
            "water_body": water_body,
            "stats": {
                "total_measurements": result[0],
                "avg_surface_area": float(result[1]) if result[1] else None,
                "avg_ndwi": float(result[2]) if result[2] else None,
                "last_measurement_date": result[3],
                "surface_trend": result[4],
            }
        }


crud_water_body = CRUDWaterBody()
