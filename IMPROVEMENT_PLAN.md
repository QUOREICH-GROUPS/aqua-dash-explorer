# AquaDash Explorer - Improvement Plan
## Migration to PostgreSQL + FastAPI + AI Architecture

---

## 📊 Current State Analysis

### ✅ What's Working
- **Frontend**: React + Vite + TypeScript with ArcGIS integration
- **UI**: shadcn/ui + Tailwind CSS (modern, accessible)
- **State Management**: Zustand stores (lightweight, effective)
- **Database**: Supabase PostgreSQL (but not utilized yet - no tables)
- **Geospatial**: ArcGIS 3D mapping with drawing tools

### ⚠️ Critical Gaps
1. **No Database Schema**: Supabase connected but no tables created
2. **Hardcoded Data**: Water bodies data in `src/data/waterBodiesData.ts`
3. **Mock AI**: Edge Function returns random/simulated data
4. **No Real ML Models**: No satellite imagery analysis, no NDWI calculation
5. **Limited Backend**: Single Deno Edge Function, no proper API layer
6. **No Data Pipeline**: No ETL for satellite data, weather, or agriculture statistics

---

## 🎯 Target Architecture: PostgreSQL + FastAPI + AI

```
SmartWaterWatch/
│
├── frontend/                    # React + Vite + TypeScript + ArcGIS
│   ├── src/
│   │   ├── pages/              # Current pages (Dashboard, Map, etc.)
│   │   ├── components/         # Current components
│   │   ├── stores/             # Zustand stores
│   │   ├── hooks/              # React hooks
│   │   ├── services/           # NEW: API clients for FastAPI
│   │   └── agents/             # NEW: AI agents for frontend intelligence
│   └── package.json
│
├── backend/                     # NEW: FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── water_bodies.py
│   │   │   │   │   ├── analysis.py
│   │   │   │   │   ├── agriculture.py
│   │   │   │   │   ├── weather.py
│   │   │   │   │   └── satellite.py
│   │   │   │   └── api.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── water_body.py
│   │   │   ├── analysis.py
│   │   │   ├── agriculture_zone.py
│   │   │   └── alert.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── water_body.py
│   │   │   └── analysis.py
│   │   ├── services/
│   │   │   ├── water_analysis.py
│   │   │   ├── satellite_service.py
│   │   │   ├── weather_service.py
│   │   │   └── ml_service.py
│   │   ├── crud/                # Database operations
│   │   └── main.py
│   ├── alembic/                 # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ai_pipeline/                 # NEW: ML/AI Pipeline
│   ├── data/
│   │   ├── raw/                # Raw satellite imagery
│   │   ├── processed/          # Processed data
│   │   └── training/           # Training datasets
│   ├── models/
│   │   ├── ndwi_calculator/    # NDWI computation model
│   │   ├── water_segmentation/ # U-Net for water body detection
│   │   ├── forecasting/        # Time series forecasting (LSTM/Prophet)
│   │   └── anomaly_detection/  # Isolation Forest for anomalies
│   ├── notebooks/
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_ndwi_analysis.ipynb
│   │   ├── 03_model_training.ipynb
│   │   └── 04_evaluation.ipynb
│   ├── scripts/
│   │   ├── download_sentinel.py    # Sentinel-2 data download
│   │   ├── preprocess_images.py
│   │   ├── train_model.py
│   │   └── batch_inference.py
│   ├── api/                     # FastAPI for ML inference
│   │   ├── main.py
│   │   └── inference.py
│   └── requirements.txt
│
├── database/
│   ├── migrations/             # SQL migration scripts
│   ├── seeds/                  # Initial data
│   └── schema.sql              # Database schema
│
├── docker-compose.yml          # PostgreSQL + FastAPI + Frontend
├── .env.example
└── README.md
```

---

## 🗄️ PostgreSQL Database Schema

### 1. Water Bodies Table
```sql
CREATE TABLE water_bodies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('lake', 'river', 'reservoir', 'wetland')),
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,  -- PostGIS
    centroid GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_water_bodies_region ON water_bodies(region);
CREATE INDEX idx_water_bodies_type ON water_bodies(type);
CREATE INDEX idx_water_bodies_geometry ON water_bodies USING GIST(geometry);
```

### 2. Water Body Measurements (Time Series)
```sql
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
    source VARCHAR(50),  -- 'satellite', 'sensor', 'manual'
    satellite_image_url TEXT,
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_measurements_water_body ON water_measurements(water_body_id);
CREATE INDEX idx_measurements_date ON water_measurements(measurement_date DESC);
CREATE UNIQUE INDEX idx_measurements_unique ON water_measurements(water_body_id, measurement_date, source);
```

### 3. AI Analysis Results
```sql
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_body_id UUID REFERENCES water_bodies(id),
    user_drawn_geometry GEOMETRY(GEOMETRY, 4326),  -- For custom analysis
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    surface_value DECIMAL(10, 2),
    surface_unit VARCHAR(10),
    surface_variation DECIMAL(5, 2),
    ndwi_average DECIMAL(5, 3),
    ndwi_trend VARCHAR(20),
    model_version VARCHAR(50),
    processing_time_ms INTEGER,
    anomalies JSONB,  -- [{"type": "...", "severity": "...", "description": "..."}]
    forecast JSONB,   -- [{"day": 1, "predictedSurface": 1000, "confidence": 0.95}]
    alerts JSONB,
    suggestions JSONB,
    metadata JSONB
);

CREATE INDEX idx_analysis_water_body ON analysis_results(water_body_id);
CREATE INDEX idx_analysis_date ON analysis_results(analysis_date DESC);
```

### 4. Agriculture Zones
```sql
CREATE TABLE agriculture_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    region VARCHAR(100) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    surface_ha DECIMAL(10, 2),
    average_yield DECIMAL(6, 2),  -- tons/ha
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agriculture_region ON agriculture_zones(region);
CREATE INDEX idx_agriculture_crop ON agriculture_zones(crop_type);
CREATE INDEX idx_agriculture_geometry ON agriculture_zones USING GIST(geometry);
```

### 5. Weather Data
```sql
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weather_location ON weather_data(location_name);
CREATE INDEX idx_weather_date ON weather_data(measurement_date DESC);
```

### 6. Alerts & Notifications
```sql
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
    metadata JSONB
);

CREATE INDEX idx_alerts_water_body ON alerts(water_body_id);
CREATE INDEX idx_alerts_active ON alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alerts_severity ON alerts(severity);
```

---

## 🚀 FastAPI Backend Structure

### 1. Main Application (`backend/app/main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="SmartWaterWatch API",
    description="Water resources monitoring and AI analysis API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 2. Water Bodies Endpoint (`backend/app/api/v1/endpoints/water_bodies.py`)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.crud import crud_water_body
from app.schemas.water_body import WaterBody, WaterBodyCreate, WaterBodyUpdate

router = APIRouter()

@router.get("/", response_model=List[WaterBody])
def get_water_bodies(
    skip: int = 0,
    limit: int = 100,
    region: str = None,
    water_type: str = None,
    db: Session = Depends(deps.get_db)
):
    """Get all water bodies with optional filters"""
    return crud_water_body.get_multi(
        db, skip=skip, limit=limit,
        filters={"region": region, "type": water_type}
    )

@router.get("/{water_body_id}", response_model=WaterBody)
def get_water_body(water_body_id: str, db: Session = Depends(deps.get_db)):
    """Get specific water body by ID"""
    water_body = crud_water_body.get(db, id=water_body_id)
    if not water_body:
        raise HTTPException(status_code=404, detail="Water body not found")
    return water_body

@router.get("/{water_body_id}/measurements")
def get_water_body_measurements(
    water_body_id: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(deps.get_db)
):
    """Get time series measurements for a water body"""
    return crud_water_body.get_measurements(
        db, water_body_id=water_body_id,
        start_date=start_date, end_date=end_date
    )
```

### 3. AI Analysis Endpoint (`backend/app/api/v1/endpoints/analysis.py`)
```python
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.analysis import AnalysisRequest, AnalysisResult
from app.services.ml_service import MLService
from app.services.water_analysis import WaterAnalysisService

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_water_body(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    ml_service: MLService = Depends(deps.get_ml_service)
):
    """
    Analyze water body using AI models
    - NDWI calculation from satellite imagery
    - Surface area estimation
    - Anomaly detection
    - Forecast generation
    """
    analysis_service = WaterAnalysisService(db, ml_service)

    result = await analysis_service.analyze_geometry(
        geometry=request.geometry,
        parameters=request.parameters
    )

    # Save analysis result to database (async)
    background_tasks.add_task(
        analysis_service.save_analysis_result,
        result
    )

    return result

@router.get("/history")
def get_analysis_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(deps.get_db)
):
    """Get analysis history"""
    return crud_analysis.get_multi(db, skip=skip, limit=limit)
```

### 4. Satellite Service (`backend/app/services/satellite_service.py`)
```python
import requests
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from sentinelhub import SHConfig, SentinelHubRequest, DataCollection, MimeType, CRS, BBox
from app.core.config import settings

class SatelliteService:
    def __init__(self):
        self.config = SHConfig()
        self.config.sh_client_id = settings.SENTINEL_CLIENT_ID
        self.config.sh_client_secret = settings.SENTINEL_CLIENT_SECRET

    def get_sentinel2_image(
        self,
        bbox: list,
        date_from: datetime,
        date_to: datetime,
        resolution: int = 10
    ) -> Optional[np.ndarray]:
        """
        Download Sentinel-2 imagery for specified bounding box
        """
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: ["B03", "B08", "B11"],
                output: { bands: 3 }
            };
        }
        function evaluatePixel(sample) {
            return [sample.B03, sample.B08, sample.B11];
        }
        """

        request = SentinelHubRequest(
            evalscript=evalscript,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L2A,
                    time_interval=(date_from, date_to)
                )
            ],
            responses=[
                SentinelHubRequest.output_response("default", MimeType.TIFF)
            ],
            bbox=BBox(bbox=bbox, crs=CRS.WGS84),
            size=(resolution, resolution),
            config=self.config
        )

        return request.get_data()[0]

    def calculate_ndwi(self, image: np.ndarray) -> np.ndarray:
        """
        Calculate NDWI (Normalized Difference Water Index)
        NDWI = (Green - NIR) / (Green + NIR)
        """
        green = image[:, :, 0].astype(float)
        nir = image[:, :, 1].astype(float)

        # Avoid division by zero
        denominator = green + nir
        denominator[denominator == 0] = 1e-10

        ndwi = (green - nir) / denominator
        return ndwi
```

### 5. ML Service (`backend/app/services/ml_service.py`)
```python
import joblib
import numpy as np
from typing import Dict, List, Tuple
import tensorflow as tf
from pathlib import Path

class MLService:
    def __init__(self):
        self.models_path = Path("ai_pipeline/models")
        self.water_segmentation_model = self._load_segmentation_model()
        self.forecasting_model = self._load_forecasting_model()
        self.anomaly_detector = self._load_anomaly_detector()

    def _load_segmentation_model(self):
        """Load U-Net water segmentation model"""
        model_path = self.models_path / "water_segmentation" / "unet_model.h5"
        if model_path.exists():
            return tf.keras.models.load_model(str(model_path))
        return None

    def _load_forecasting_model(self):
        """Load time series forecasting model"""
        model_path = self.models_path / "forecasting" / "lstm_model.pkl"
        if model_path.exists():
            return joblib.load(model_path)
        return None

    def _load_anomaly_detector(self):
        """Load anomaly detection model"""
        model_path = self.models_path / "anomaly_detection" / "isolation_forest.pkl"
        if model_path.exists():
            return joblib.load(model_path)
        return None

    def segment_water_body(self, satellite_image: np.ndarray) -> np.ndarray:
        """Segment water body from satellite image"""
        if self.water_segmentation_model is None:
            raise ValueError("Water segmentation model not loaded")

        # Preprocess image
        preprocessed = self._preprocess_image(satellite_image)

        # Predict
        prediction = self.water_segmentation_model.predict(preprocessed)
        return prediction[0]

    def detect_anomalies(self, measurements: List[Dict]) -> List[Dict]:
        """Detect anomalies in water measurements"""
        if self.anomaly_detector is None:
            return []

        features = self._extract_features(measurements)
        predictions = self.anomaly_detector.predict(features)

        anomalies = []
        for idx, pred in enumerate(predictions):
            if pred == -1:  # Anomaly detected
                anomalies.append({
                    "index": idx,
                    "measurement": measurements[idx],
                    "type": self._classify_anomaly(measurements[idx]),
                    "severity": self._calculate_severity(measurements[idx])
                })

        return anomalies

    def forecast_surface_area(
        self,
        historical_data: List[float],
        periods: int = 7
    ) -> List[Dict]:
        """Forecast water surface area for next N periods"""
        if self.forecasting_model is None:
            # Fallback to simple moving average
            return self._simple_forecast(historical_data, periods)

        predictions = self.forecasting_model.predict(periods)

        forecast = []
        for day, pred in enumerate(predictions, 1):
            forecast.append({
                "day": day,
                "predicted_surface": float(pred),
                "confidence": self._calculate_confidence(day)
            })

        return forecast
```

---

## 🤖 AI Pipeline Implementation

### 1. Sentinel-2 Data Download (`ai_pipeline/scripts/download_sentinel.py`)
```python
import ee
from datetime import datetime, timedelta
from pathlib import Path

# Initialize Earth Engine
ee.Initialize()

def download_sentinel2_for_burkina_faso(
    start_date: str,
    end_date: str,
    output_dir: Path
):
    """
    Download Sentinel-2 imagery for water bodies in Burkina Faso
    """
    # Define ROI (Burkina Faso bounds)
    burkina_faso = ee.Geometry.Rectangle([-5.5, 9.4, 2.4, 15.1])

    # Load Sentinel-2 collection
    collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterBounds(burkina_faso)
                  .filterDate(start_date, end_date)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))

    # Select relevant bands for NDWI
    bands = ['B3', 'B8', 'B11']  # Green, NIR, SWIR

    # Export images
    images = collection.select(bands).toList(collection.size())

    for i in range(images.size().getInfo()):
        image = ee.Image(images.get(i))
        task = ee.batch.Export.image.toDrive(
            image=image,
            description=f'sentinel2_burkina_{i}',
            folder='sentinel_burkina_faso',
            scale=10,
            region=burkina_faso
        )
        task.start()
        print(f"Export task {i} started")
```

### 2. Water Segmentation Model Training (`ai_pipeline/notebooks/03_model_training.ipynb`)
```python
import tensorflow as tf
from tensorflow.keras import layers, models

def build_unet_model(input_shape=(256, 256, 3)):
    """
    U-Net architecture for water body segmentation
    """
    inputs = layers.Input(shape=input_shape)

    # Encoder
    c1 = layers.Conv2D(64, 3, activation='relu', padding='same')(inputs)
    c1 = layers.Conv2D(64, 3, activation='relu', padding='same')(c1)
    p1 = layers.MaxPooling2D((2, 2))(c1)

    c2 = layers.Conv2D(128, 3, activation='relu', padding='same')(p1)
    c2 = layers.Conv2D(128, 3, activation='relu', padding='same')(c2)
    p2 = layers.MaxPooling2D((2, 2))(c2)

    c3 = layers.Conv2D(256, 3, activation='relu', padding='same')(p2)
    c3 = layers.Conv2D(256, 3, activation='relu', padding='same')(c3)
    p3 = layers.MaxPooling2D((2, 2))(c3)

    # Bottleneck
    c4 = layers.Conv2D(512, 3, activation='relu', padding='same')(p3)
    c4 = layers.Conv2D(512, 3, activation='relu', padding='same')(c4)

    # Decoder
    u5 = layers.UpSampling2D((2, 2))(c4)
    u5 = layers.concatenate([u5, c3])
    c5 = layers.Conv2D(256, 3, activation='relu', padding='same')(u5)
    c5 = layers.Conv2D(256, 3, activation='relu', padding='same')(c5)

    u6 = layers.UpSampling2D((2, 2))(c5)
    u6 = layers.concatenate([u6, c2])
    c6 = layers.Conv2D(128, 3, activation='relu', padding='same')(u6)
    c6 = layers.Conv2D(128, 3, activation='relu', padding='same')(c6)

    u7 = layers.UpSampling2D((2, 2))(c6)
    u7 = layers.concatenate([u7, c1])
    c7 = layers.Conv2D(64, 3, activation='relu', padding='same')(u7)
    c7 = layers.Conv2D(64, 3, activation='relu', padding='same')(c7)

    outputs = layers.Conv2D(1, 1, activation='sigmoid')(c7)

    model = models.Model(inputs=[inputs], outputs=[outputs])
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.MeanIoU(num_classes=2)]
    )

    return model
```

### 3. NDWI Analysis (`ai_pipeline/scripts/calculate_ndwi.py`)
```python
import rasterio
import numpy as np
from pathlib import Path

def calculate_ndwi_from_sentinel(image_path: Path) -> np.ndarray:
    """
    Calculate NDWI from Sentinel-2 bands
    NDWI = (Green - NIR) / (Green + NIR)
    Or using SWIR: NDWI = (Green - SWIR) / (Green + SWIR) (McFeeters)
    """
    with rasterio.open(image_path) as src:
        green = src.read(1).astype(float)  # B3
        nir = src.read(2).astype(float)    # B8
        swir = src.read(3).astype(float)   # B11

    # Calculate NDWI (using SWIR for better results)
    denominator = green + swir
    denominator[denominator == 0] = 1e-10

    ndwi = (green - swir) / denominator

    return ndwi

def extract_water_surface_area(ndwi: np.ndarray, threshold: float = 0.3) -> float:
    """
    Extract water surface area from NDWI
    NDWI > 0.3 typically indicates water
    """
    water_pixels = np.sum(ndwi > threshold)

    # Assuming 10m resolution for Sentinel-2
    pixel_area_m2 = 10 * 10  # 100 m²
    water_area_m2 = water_pixels * pixel_area_m2
    water_area_ha = water_area_m2 / 10000

    return water_area_ha
```

---

## 🔄 Migration Steps

### Phase 1: Database Setup (Week 1)
1. **Install PostGIS extension** in Supabase:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Create all tables** from the schema above

3. **Migrate hardcoded data** from `waterBodiesData.ts` to PostgreSQL:
   ```python
   # Create migration script: database/seeds/001_water_bodies.py
   ```

4. **Set up Alembic** for database migrations:
   ```bash
   cd backend
   alembic init alembic
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

### Phase 2: FastAPI Backend (Week 2)
1. **Setup FastAPI project structure**:
   ```bash
   cd backend
   pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-dotenv
   ```

2. **Implement core modules**:
   - Database connection
   - Configuration management
   - CRUD operations

3. **Implement API endpoints**:
   - Water bodies CRUD
   - Measurements retrieval
   - Basic analysis endpoint

4. **Test with Postman/cURL**

### Phase 3: Frontend Integration (Week 2-3)
1. **Create API service layer** in `frontend/src/services/`:
   ```typescript
   // src/services/api/waterBodiesApi.ts
   import axios from 'axios';

   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

   export const waterBodiesApi = {
     getAll: async (params?: { region?: string; type?: string }) => {
       const response = await axios.get(`${API_BASE_URL}/api/v1/water-bodies`, { params });
       return response.data;
     },

     getById: async (id: string) => {
       const response = await axios.get(`${API_BASE_URL}/api/v1/water-bodies/${id}`);
       return response.data;
     },

     getMeasurements: async (id: string, startDate?: string, endDate?: string) => {
       const response = await axios.get(
         `${API_BASE_URL}/api/v1/water-bodies/${id}/measurements`,
         { params: { start_date: startDate, end_date: endDate } }
       );
       return response.data;
     }
   };
   ```

2. **Update hooks** to use real API:
   ```typescript
   // src/hooks/useWaterBodies.ts
   import { useQuery } from '@tanstack/react-query';
   import { waterBodiesApi } from '@/services/api/waterBodiesApi';

   export const useWaterBodies = (filters?: { region?: string; type?: string }) => {
     return useQuery({
       queryKey: ['waterBodies', filters],
       queryFn: () => waterBodiesApi.getAll(filters)
     });
   };
   ```

3. **Remove hardcoded data** from `waterBodiesData.ts`

### Phase 4: AI Pipeline Setup (Week 3-4)
1. **Setup Python environment**:
   ```bash
   cd ai_pipeline
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Requirements** (`ai_pipeline/requirements.txt`):
   ```
   numpy==1.24.3
   pandas==2.0.3
   rasterio==1.3.7
   geopandas==0.13.2
   scikit-learn==1.3.0
   tensorflow==2.13.0
   sentinelhub==3.9.0
   earthengine-api==0.1.360
   prophet==1.1.4
   joblib==1.3.1
   ```

3. **Download initial Sentinel-2 data** for Burkina Faso water bodies

4. **Train initial models**:
   - Water segmentation U-Net
   - Time series forecasting (LSTM or Prophet)
   - Anomaly detection (Isolation Forest)

5. **Create batch inference scripts** for regular updates

### Phase 5: Advanced AI Integration (Week 4-5)
1. **Integrate ML models** with FastAPI backend

2. **Implement real NDWI calculation** using Sentinel-2 data

3. **Setup automated data pipeline**:
   - Daily Sentinel-2 data download
   - Batch inference on all water bodies
   - Store results in PostgreSQL

4. **Create background tasks** for asynchronous processing:
   ```python
   # backend/app/tasks/satellite_processing.py
   from celery import Celery

   celery_app = Celery('tasks', broker='redis://localhost:6379')

   @celery_app.task
   def process_satellite_image(water_body_id: str, date: str):
       # Download Sentinel-2 image
       # Calculate NDWI
       # Estimate surface area
       # Store in database
       pass
   ```

### Phase 6: Frontend AI Agents (Week 5-6)
1. **Create AI agent components** in `frontend/src/agents/`:

```typescript
// src/agents/WaterAnalysisAgent.ts
export class WaterAnalysisAgent {
  async analyzePattern(measurements: Measurement[]): Promise<Analysis> {
    // Client-side pattern recognition
    const trend = this.detectTrend(measurements);
    const seasonality = this.detectSeasonality(measurements);
    const anomalies = this.detectSimpleAnomalies(measurements);

    return { trend, seasonality, anomalies };
  }

  private detectTrend(data: Measurement[]) {
    // Simple linear regression
    // ...
  }

  private detectSeasonality(data: Measurement[]) {
    // FFT or autocorrelation
    // ...
  }
}
```

2. **Implement smart recommendations**:
```typescript
// src/agents/RecommendationAgent.ts
export class RecommendationAgent {
  generateRecommendations(
    waterBody: WaterBody,
    recentMeasurements: Measurement[],
    weather: WeatherData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Rule-based system
    if (waterBody.status === 'critical') {
      recommendations.push({
        type: 'alert',
        priority: 'high',
        message: 'Niveau d\'eau critique - irrigation à risque'
      });
    }

    // ML-based predictions
    // ...

    return recommendations;
  }
}
```

### Phase 7: Deployment (Week 6)
1. **Dockerize all services**:
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     postgres:
       image: postgis/postgis:15-3.3
       environment:
         POSTGRES_DB: smartwaterwatch
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

     backend:
       build: ./backend
       ports:
         - "8000:8000"
       depends_on:
         - postgres
       environment:
         DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/smartwaterwatch

     frontend:
       build: ./frontend
       ports:
         - "8080:8080"
       depends_on:
         - backend

     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"

     celery_worker:
       build: ./backend
       command: celery -A app.tasks worker --loglevel=info
       depends_on:
         - redis
         - postgres

   volumes:
     postgres_data:
   ```

2. **Setup CI/CD** (GitHub Actions):
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to production
           run: |
             docker-compose -f docker-compose.prod.yml up -d --build
   ```

---

## 📈 Expected Improvements

### Technical Improvements
1. **Real AI/ML Models** instead of mock data:
   - U-Net for water body segmentation
   - LSTM/Prophet for forecasting
   - Isolation Forest for anomaly detection

2. **Actual Satellite Data** from Sentinel-2 (free, 10m resolution)

3. **Proper Database** with time series data and PostGIS for spatial queries

4. **Scalable Architecture** with FastAPI + Celery for async processing

5. **Better State Management** with React Query for server state

### Functional Improvements
1. **Historical Data Analysis**: Track water body changes over months/years

2. **Automated Alerts**: Email/SMS notifications for critical conditions

3. **Better Forecasting**: 7-day predictions with confidence intervals

4. **Agriculture Impact Analysis**: Real correlation with crop yields

5. **Multi-source Data Fusion**: Combine satellite, weather, and ground sensors

### Performance Improvements
1. **Caching**: Redis for frequently accessed data

2. **Batch Processing**: Celery for background tasks

3. **Database Optimization**: Indexes, materialized views

4. **API Performance**: FastAPI is 3x faster than Flask

---

## 🎯 Quick Start Checklist

- [ ] Enable PostGIS in Supabase
- [ ] Create database schema
- [ ] Setup FastAPI backend project
- [ ] Implement water bodies CRUD endpoints
- [ ] Create frontend API service layer
- [ ] Remove hardcoded data, use real API
- [ ] Setup Python environment for AI pipeline
- [ ] Download sample Sentinel-2 imagery
- [ ] Implement NDWI calculation
- [ ] Train water segmentation model
- [ ] Integrate ML models with FastAPI
- [ ] Setup Celery for background tasks
- [ ] Implement automated data pipeline
- [ ] Deploy with Docker Compose
- [ ] Setup monitoring and logging

---

## 📚 Resources & Documentation

### Satellite Data
- **Sentinel-2**: https://scihub.copernicus.eu/
- **Earth Engine**: https://earthengine.google.com/
- **Sentinel Hub**: https://www.sentinel-hub.com/

### ML/AI
- **TensorFlow**: https://www.tensorflow.org/tutorials/images/segmentation
- **Prophet**: https://facebook.github.io/prophet/
- **Scikit-learn**: https://scikit-learn.org/stable/modules/outlier_detection.html

### FastAPI
- **Documentation**: https://fastapi.tiangolo.com/
- **Full Stack Template**: https://github.com/tiangolo/full-stack-fastapi-postgresql

### PostGIS
- **Documentation**: https://postgis.net/documentation/
- **Spatial Queries**: https://postgis.net/workshops/postgis-intro/

---

**Next Steps**: Start with Phase 1 (Database Setup) and progressively migrate the existing functionality while adding real AI capabilities.
