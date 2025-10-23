# AquaDash Explorer - Local Implementation Guide
## PostgreSQL + FastAPI + AI (Without Docker)

---

## 🎯 Quick Start: Week-by-Week Implementation

### Prerequisites
```bash
# Required software
- Python 3.10+ (for FastAPI backend)
- Node.js 18+ (already installed)
- PostgreSQL 15+ with PostGIS
- Git

# Optional but recommended
- PostgreSQL GUI: pgAdmin 4 or DBeaver
- API Testing: Postman or Thunder Client (VS Code)
- Python IDE: VS Code with Python extension
```

---

## Phase 1: Database Setup (Day 1-2)

### Step 1.1: Install PostgreSQL Locally

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15 postgis
```

**macOS:**
```bash
brew install postgresql@15 postgis
brew services start postgresql@15
```

### Step 1.2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql console:
CREATE DATABASE smartwaterwatch;
\c smartwaterwatch

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Verify PostGIS installation
SELECT PostGIS_Version();

# Exit psql
\q
```

### Step 1.3: Create Database Schema

Create file: `database/schema.sql`

```sql
-- ============================================
-- WATER BODIES TABLE
-- ============================================
CREATE TABLE water_bodies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('lake', 'river', 'reservoir', 'wetland')),
    geometry GEOMETRY(POLYGON, 4326),
    centroid GEOGRAPHY(POINT, 4326),
    surface_area_ha DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_water_bodies_region ON water_bodies(region);
CREATE INDEX idx_water_bodies_type ON water_bodies(type);
CREATE INDEX idx_water_bodies_geometry ON water_bodies USING GIST(geometry);
CREATE INDEX idx_water_bodies_centroid ON water_bodies USING GIST(centroid);

-- ============================================
-- WATER MEASUREMENTS TABLE (Time Series)
-- ============================================
CREATE TABLE water_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_body_id UUID REFERENCES water_bodies(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    surface_area_ha DECIMAL(10, 2),
    ndwi_average DECIMAL(5, 3),
    ndwi_min DECIMAL(5, 3),
    ndwi_max DECIMAL(5, 3),
    water_level_m DECIMAL(6, 2),
    temperature_c DECIMAL(4, 1),
    turbidity_ntu DECIMAL(6, 2),
    source VARCHAR(50) DEFAULT 'manual',
    satellite_image_url TEXT,
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_measurements_water_body ON water_measurements(water_body_id);
CREATE INDEX idx_measurements_date ON water_measurements(measurement_date DESC);
CREATE UNIQUE INDEX idx_measurements_unique ON water_measurements(water_body_id, measurement_date, source);

-- ============================================
-- ANALYSIS RESULTS TABLE
-- ============================================
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_body_id UUID REFERENCES water_bodies(id),
    user_drawn_geometry GEOMETRY(GEOMETRY, 4326),
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    surface_value DECIMAL(10, 2),
    surface_unit VARCHAR(10) DEFAULT 'ha',
    surface_variation DECIMAL(5, 2),
    ndwi_average DECIMAL(5, 3),
    ndwi_trend VARCHAR(20),
    model_version VARCHAR(50) DEFAULT 'v1.0',
    processing_time_ms INTEGER,
    anomalies JSONB DEFAULT '[]'::jsonb,
    forecast JSONB DEFAULT '[]'::jsonb,
    alerts JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    agriculture_stats JSONB,
    weather_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_analysis_water_body ON analysis_results(water_body_id);
CREATE INDEX idx_analysis_date ON analysis_results(analysis_date DESC);
CREATE INDEX idx_analysis_geometry ON analysis_results USING GIST(user_drawn_geometry);

-- ============================================
-- AGRICULTURE ZONES TABLE
-- ============================================
CREATE TABLE agriculture_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    region VARCHAR(100) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    surface_ha DECIMAL(10, 2),
    average_yield DECIMAL(6, 2),
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agriculture_region ON agriculture_zones(region);
CREATE INDEX idx_agriculture_crop ON agriculture_zones(crop_type);
CREATE INDEX idx_agriculture_geometry ON agriculture_zones USING GIST(geometry);

-- ============================================
-- WEATHER DATA TABLE
-- ============================================
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name VARCHAR(255),
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature_c DECIMAL(4, 1),
    humidity_percent INTEGER,
    precipitation_mm DECIMAL(6, 2),
    wind_speed_kmh DECIMAL(5, 2),
    condition VARCHAR(50),
    source VARCHAR(50) DEFAULT 'open-meteo',
    forecast_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weather_location ON weather_data(location_name);
CREATE INDEX idx_weather_date ON weather_data(measurement_date DESC);
CREATE INDEX idx_weather_coordinates ON weather_data USING GIST(coordinates);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_body_id UUID REFERENCES water_bodies(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_alerts_water_body ON alerts(water_body_id);
CREATE INDEX idx_alerts_active ON alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_water_bodies_updated_at BEFORE UPDATE ON water_bodies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agriculture_zones_updated_at BEFORE UPDATE ON agriculture_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Execute the schema:**
```bash
psql -U postgres -d smartwaterwatch -f database/schema.sql
```

### Step 1.4: Seed Initial Data

Create file: `database/seeds/001_initial_data.sql`

```sql
-- Insert water bodies from your existing data
INSERT INTO water_bodies (name, region, type, centroid, surface_area_ha, metadata) VALUES
('Barrage de Bagré', 'Centre-Est', 'reservoir',
 ST_SetSRID(ST_MakePoint(-0.5467, 11.4769), 4326), 23500,
 '{"status": "warning", "alerts": 2, "variation": -2.8, "ndwi": 0.42}'::jsonb),

('Barrage de Kompienga', 'Est', 'reservoir',
 ST_SetSRID(ST_MakePoint(0.6998, 11.0821), 4326), 19400,
 '{"status": "good", "alerts": 0, "variation": -1.5, "ndwi": 0.38}'::jsonb),

('Barrage de Sourou', 'Boucle du Mouhoun', 'reservoir',
 ST_SetSRID(ST_MakePoint(-3.2167, 12.9333), 4326), 15600,
 '{"status": "warning", "alerts": 1, "variation": -3.2, "ndwi": 0.35}'::jsonb),

('Barrage de Samendeni', 'Hauts-Bassins', 'reservoir',
 ST_SetSRID(ST_MakePoint(-4.4667, 11.2167), 4326), 12800,
 '{"status": "good", "alerts": 0, "variation": 1.2, "ndwi": 0.44}'::jsonb),

('Barrage de Loumbila', 'Plateau-Central', 'reservoir',
 ST_SetSRID(ST_MakePoint(-1.3690, 12.5015), 4326), 780,
 '{"status": "critical", "alerts": 3, "variation": -4.5, "ndwi": 0.32}'::jsonb),

('Barrage de Ziga', 'Plateau-Central', 'reservoir',
 ST_SetSRID(ST_MakePoint(-1.5333, 12.4833), 4326), 2100,
 '{"status": "warning", "alerts": 1, "variation": -2.1, "ndwi": 0.36}'::jsonb),

('Lac Bam', 'Centre-Nord', 'lake',
 ST_SetSRID(ST_MakePoint(-1.5167, 13.3833), 4326), 3200,
 '{"status": "critical", "alerts": 4, "variation": -5.8, "ndwi": 0.28}'::jsonb),

('Mare aux hippopotames', 'Hauts-Bassins', 'wetland',
 ST_SetSRID(ST_MakePoint(-4.4167, 11.5167), 4326), 1920,
 '{"status": "good", "alerts": 0, "variation": 0.8, "ndwi": 0.41}'::jsonb),

('Barrage de Moussodougou', 'Cascades', 'reservoir',
 ST_SetSRID(ST_MakePoint(-4.8000, 10.4833), 4326), 680,
 '{"status": "good", "alerts": 0, "variation": 1.5, "ndwi": 0.43}'::jsonb),

('Barrage de Toécé', 'Sud-Ouest', 'reservoir',
 ST_SetSRID(ST_MakePoint(-3.1833, 10.8500), 4326), 520,
 '{"status": "good", "alerts": 1, "variation": -1.8, "ndwi": 0.37}'::jsonb);

-- Insert agriculture zones
INSERT INTO agriculture_zones (name, region, crop_type, geometry, surface_ha, average_yield) VALUES
('Zone Maïs Centre', 'Centre', 'Maïs',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-1.7 12.5, -1.3 12.5, -1.3 12.1, -1.7 12.1, -1.7 12.5)')), 4326),
 12500, 2.8),

('Zone Coton Est', 'Est', 'Coton',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(0.2 11.5, 1.2 11.5, 1.2 11.0, 0.2 11.0, 0.2 11.5)')), 4326),
 15200, 1.8),

('Zone Riz Hauts-Bassins', 'Hauts-Bassins', 'Riz',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-4.8 11.4, -4.0 11.4, -4.0 10.8, -4.8 10.8, -4.8 11.4)')), 4326),
 8900, 3.2),

('Zone Mil Centre-Nord', 'Centre-Nord', 'Mil',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-2.0 13.5, -1.0 13.5, -1.0 12.8, -2.0 12.8, -2.0 13.5)')), 4326),
 18700, 1.2),

('Zone Sorgho Sud-Ouest', 'Sud-Ouest', 'Sorgho',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-3.5 11.2, -2.5 11.2, -2.5 10.5, -3.5 10.5, -3.5 11.2)')), 4326),
 10300, 1.5);

-- Generate some historical measurements (last 30 days)
INSERT INTO water_measurements (water_body_id, measurement_date, surface_area_ha, ndwi_average, source)
SELECT
    id,
    CURRENT_DATE - (n || ' days')::interval,
    surface_area_ha * (1 + (random() * 0.1 - 0.05)),  -- ±5% variation
    (metadata->>'ndwi')::decimal * (1 + (random() * 0.1 - 0.05)),
    'historical'
FROM water_bodies
CROSS JOIN generate_series(0, 29) AS n;
```

**Execute the seeds:**
```bash
psql -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql
```

---

## Phase 2: FastAPI Backend Setup (Day 3-5)

### Step 2.1: Create Backend Directory Structure

```bash
mkdir -p backend/app/{api/v1/endpoints,core,models,schemas,crud,services}
cd backend
```

### Step 2.2: Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Step 2.3: Install Dependencies

Create `backend/requirements.txt`:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
geoalchemy2==0.14.3
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
python-multipart==0.0.6
httpx==0.26.0
numpy==1.26.3
pandas==2.1.4
shapely==2.0.2
```

```bash
pip install -r requirements.txt
```

### Step 2.4: Create Configuration

Create `backend/app/core/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Settings
    PROJECT_NAME: str = "SmartWaterWatch API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/smartwaterwatch"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
    ]

    # External APIs
    OPEN_METEO_API_URL: str = "https://api.open-meteo.com/v1/forecast"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartwaterwatch
```

### Step 2.5: Create Database Connection

Create `backend/app/core/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=True  # Set to False in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 2.6: Create SQLAlchemy Models

Create `backend/app/models/water_body.py`:
```python
from sqlalchemy import Column, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry, Geography
import uuid
from app.core.database import Base

class WaterBody(Base):
    __tablename__ = "water_bodies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    region = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    geometry = Column(Geometry('POLYGON', srid=4326))
    centroid = Column(Geography('POINT', srid=4326))
    surface_area_ha = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    metadata = Column(JSONB, default={})
```

Create `backend/app/models/water_measurement.py`:
```python
from sqlalchemy import Column, String, Numeric, DateTime, Date, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class WaterMeasurement(Base):
    __tablename__ = "water_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    water_body_id = Column(UUID(as_uuid=True), ForeignKey("water_bodies.id", ondelete="CASCADE"))
    measurement_date = Column(Date, nullable=False)
    surface_area_ha = Column(Numeric(10, 2))
    ndwi_average = Column(Numeric(5, 3))
    ndwi_min = Column(Numeric(5, 3))
    ndwi_max = Column(Numeric(5, 3))
    water_level_m = Column(Numeric(6, 2))
    temperature_c = Column(Numeric(4, 1))
    turbidity_ntu = Column(Numeric(6, 2))
    source = Column(String(50), default="manual")
    satellite_image_url = Column(String)
    confidence_score = Column(Numeric(3, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### Step 2.7: Create Pydantic Schemas

Create `backend/app/schemas/water_body.py`:
```python
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class WaterBodyBase(BaseModel):
    name: str
    region: str
    type: str
    surface_area_ha: Optional[float] = None

class WaterBodyCreate(WaterBodyBase):
    geometry: Optional[Dict[str, Any]] = None

class WaterBodyUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    type: Optional[str] = None
    surface_area_ha: Optional[float] = None

class WaterBody(WaterBodyBase):
    id: UUID
    centroid: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WaterBodyList(BaseModel):
    total: int
    items: list[WaterBody]
```

Create `backend/app/schemas/water_measurement.py`:
```python
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class WaterMeasurementBase(BaseModel):
    measurement_date: date
    surface_area_ha: Optional[float] = None
    ndwi_average: Optional[float] = None
    water_level_m: Optional[float] = None
    temperature_c: Optional[float] = None

class WaterMeasurementCreate(WaterMeasurementBase):
    water_body_id: UUID
    source: str = "manual"

class WaterMeasurement(WaterMeasurementBase):
    id: UUID
    water_body_id: UUID
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Step 2.8: Create CRUD Operations

Create `backend/app/crud/crud_water_body.py`:
```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from app.models.water_body import WaterBody
from app.schemas.water_body import WaterBodyCreate, WaterBodyUpdate
from geoalchemy2.functions import ST_AsGeoJSON, ST_GeomFromGeoJSON
import json

class CRUDWaterBody:
    def get(self, db: Session, id: UUID) -> Optional[WaterBody]:
        return db.query(WaterBody).filter(WaterBody.id == id).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        region: Optional[str] = None,
        water_type: Optional[str] = None
    ) -> List[WaterBody]:
        query = db.query(WaterBody)

        if region and region != "all":
            query = query.filter(WaterBody.region == region)

        if water_type and water_type != "all":
            query = query.filter(WaterBody.type == water_type)

        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: WaterBodyCreate) -> WaterBody:
        db_obj = WaterBody(**obj_in.model_dump(exclude={"geometry"}))

        if obj_in.geometry:
            # Convert GeoJSON to PostGIS geometry
            geom_json = json.dumps(obj_in.geometry)
            db_obj.geometry = func.ST_GeomFromGeoJSON(geom_json)
            db_obj.centroid = func.ST_Centroid(db_obj.geometry)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def count(self, db: Session) -> int:
        return db.query(func.count(WaterBody.id)).scalar()

crud_water_body = CRUDWaterBody()
```

### Step 2.9: Create API Endpoints

Create `backend/app/api/v1/endpoints/water_bodies.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.crud.crud_water_body import crud_water_body
from app.schemas.water_body import WaterBody, WaterBodyList, WaterBodyCreate

router = APIRouter()

@router.get("/", response_model=WaterBodyList)
def get_water_bodies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    region: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all water bodies with optional filters"""
    items = crud_water_body.get_multi(
        db,
        skip=skip,
        limit=limit,
        region=region,
        water_type=type
    )
    total = crud_water_body.count(db)

    return {"total": total, "items": items}

@router.get("/{water_body_id}", response_model=WaterBody)
def get_water_body(
    water_body_id: UUID,
    db: Session = Depends(get_db)
):
    """Get specific water body by ID"""
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")
    return water_body

@router.post("/", response_model=WaterBody, status_code=201)
def create_water_body(
    water_body_in: WaterBodyCreate,
    db: Session = Depends(get_db)
):
    """Create new water body"""
    return crud_water_body.create(db, obj_in=water_body_in)
```

### Step 2.10: Create Main FastAPI Application

Create `backend/app/api/v1/api.py`:
```python
from fastapi import APIRouter
from app.api.v1.endpoints import water_bodies

api_router = APIRouter()

api_router.include_router(
    water_bodies.router,
    prefix="/water-bodies",
    tags=["water-bodies"]
)
```

Create `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "SmartWaterWatch API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### Step 2.11: Run FastAPI Backend

```bash
# From backend directory
cd backend
uvicorn app.main:app --reload --port 8000

# API will be available at:
# - http://localhost:8000
# - Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

Test the API:
```bash
# Get all water bodies
curl http://localhost:8000/api/v1/water-bodies/

# With filters
curl "http://localhost:8000/api/v1/water-bodies/?region=Centre-Est&type=reservoir"
```

---

## Phase 3: Frontend Integration (Day 6-7)

### Step 3.1: Create API Service Layer

Create `frontend/src/services/api/config.ts`:
```typescript
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

Create `frontend/src/services/api/waterBodiesApi.ts`:
```typescript
import { apiClient } from './config';

export interface WaterBody {
  id: string;
  name: string;
  region: string;
  type: 'lake' | 'river' | 'reservoir' | 'wetland';
  surface_area_ha: number;
  centroid?: {
    type: string;
    coordinates: [number, number];
  };
  metadata: {
    status?: string;
    alerts?: number;
    variation?: number;
    ndwi?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface WaterBodyListResponse {
  total: number;
  items: WaterBody[];
}

export const waterBodiesApi = {
  getAll: async (params?: {
    region?: string;
    type?: string;
    skip?: number;
    limit?: number;
  }): Promise<WaterBodyListResponse> => {
    const response = await apiClient.get('/api/v1/water-bodies/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<WaterBody> => {
    const response = await apiClient.get(`/api/v1/water-bodies/${id}`);
    return response.data;
  },

  create: async (data: Partial<WaterBody>): Promise<WaterBody> => {
    const response = await apiClient.post('/api/v1/water-bodies/', data);
    return response.data;
  },
};
```

### Step 3.2: Update React Query Hooks

Create `frontend/src/hooks/useWaterBodies.ts`:
```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { waterBodiesApi, WaterBody, WaterBodyListResponse } from '@/services/api/waterBodiesApi';

export const useWaterBodies = (filters?: {
  region?: string;
  type?: string;
}): UseQueryResult<WaterBodyListResponse, Error> => {
  return useQuery({
    queryKey: ['waterBodies', filters],
    queryFn: () => waterBodiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWaterBody = (id: string): UseQueryResult<WaterBody, Error> => {
  return useQuery({
    queryKey: ['waterBody', id],
    queryFn: () => waterBodiesApi.getById(id),
    enabled: !!id,
  });
};
```

### Step 3.3: Update Environment Variables

Update `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_PROJECT_ID=srsmdererxbkfuyocjrg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://srsmdererxbkfuyocjrg.supabase.co
```

### Step 3.4: Update Dashboard to Use Real API

Update `frontend/src/pages/Dashboard.tsx` (replace the hardcoded data import):
```typescript
import { useWaterBodies } from '@/hooks/useWaterBodies';
import { useFilterStore } from '@/stores/filterStore';

export default function Dashboard() {
  const { region, waterBodyType } = useFilterStore();

  // Use real API instead of hardcoded data
  const { data, isLoading, error } = useWaterBodies({
    region: region !== 'all' ? region : undefined,
    type: waterBodyType !== 'all' ? waterBodyType : undefined,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const waterBodies = data?.items || [];

  // Rest of your dashboard code...
}
```

### Step 3.5: Test Frontend Integration

```bash
# Terminal 1: Run backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2: Run frontend
cd frontend
npm run dev

# Open browser: http://localhost:8080
```

---

## Next Steps

### Immediate Tasks
1. ✅ Database setup and seeding
2. ✅ FastAPI backend running
3. ✅ Frontend consuming real API
4. 🔄 Add measurements endpoint
5. 🔄 Add analysis endpoint with real NDWI calculation

### Week 2 Tasks
- Implement analysis endpoint with satellite data
- Add agriculture zones API
- Add weather API integration
- Create AI service layer

### Week 3+ Tasks
- ML model training (water segmentation)
- Automated data pipeline
- Background tasks for processing
- Advanced forecasting

---

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Test connection
psql -U postgres -d smartwaterwatch -c "SELECT version();"
```

### FastAPI Issues
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check database connection
python -c "from app.core.database import engine; print(engine.connect())"
```

### Frontend API Issues
- Check CORS settings in backend
- Verify API_BASE_URL in frontend/.env
- Check browser console for errors
- Use browser DevTools Network tab

---

## Commands Reference

```bash
# Database
psql -U postgres -d smartwaterwatch  # Connect to database
\dt  # List tables
\d+ water_bodies  # Describe table

# Backend
cd backend
source venv/bin/activate  # Activate virtual env
uvicorn app.main:app --reload --port 8000  # Run server
pip list  # List installed packages

# Frontend
cd frontend
npm run dev  # Run dev server
npm run build  # Build for production
npm run lint  # Run linter

# Testing
curl http://localhost:8000/health  # Test backend health
curl http://localhost:8000/api/v1/water-bodies/  # Test API
```
