"""
CRUD operations for database models
"""
from app.crud.crud_water_body import crud_water_body
from app.crud.crud_water_measurement import crud_water_measurement

__all__ = [
    "crud_water_body",
    "crud_water_measurement",
]
