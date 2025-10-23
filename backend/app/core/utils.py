"""
Utility functions for data conversion
"""
import json
from typing import Optional, Dict, Any
from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape


def geography_to_geojson(geog: Optional[WKBElement]) -> Optional[Dict[str, Any]]:
    """Convert PostGIS geography/geometry to GeoJSON dict"""
    if geog is None:
        return None

    try:
        shape = to_shape(geog)
        return json.loads(json.dumps({
            "type": shape.geom_type,
            "coordinates": list(shape.coords) if hasattr(shape, 'coords') else [shape.x, shape.y]
        }))
    except Exception as e:
        print(f"Error converting geography to GeoJSON: {e}")
        return None
