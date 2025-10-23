-- ============================================
-- SmartWaterWatch Database Schema
-- PostgreSQL 15+ with PostGIS
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

COMMENT ON TABLE water_bodies IS 'Main table for water bodies in Burkina Faso';
COMMENT ON COLUMN water_bodies.geometry IS 'Water body boundary polygon';
COMMENT ON COLUMN water_bodies.centroid IS 'Geographic center point';
COMMENT ON COLUMN water_bodies.metadata IS 'Additional data: status, alerts, variation, ndwi';

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

COMMENT ON TABLE water_measurements IS 'Time series measurements for water bodies';
COMMENT ON COLUMN water_measurements.source IS 'Data source: satellite, sensor, manual, model';

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

COMMENT ON TABLE analysis_results IS 'AI analysis results and predictions';

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

COMMENT ON TABLE agriculture_zones IS 'Agricultural zones and crop information';
COMMENT ON COLUMN agriculture_zones.average_yield IS 'Average yield in tons per hectare';

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

COMMENT ON TABLE weather_data IS 'Weather measurements and forecasts';

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

COMMENT ON TABLE alerts IS 'Alert notifications for water bodies';

-- ============================================
-- FUNCTIONS AND TRIGGERS
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

-- Function to calculate distance between water body and agriculture zone
CREATE OR REPLACE FUNCTION get_nearby_agriculture_zones(
    water_body_uuid UUID,
    buffer_distance_meters INTEGER DEFAULT 5000
)
RETURNS TABLE(
    zone_id UUID,
    zone_name VARCHAR,
    crop_type VARCHAR,
    distance_m DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        az.id,
        az.name,
        az.crop_type,
        ST_Distance(
            wb.centroid::geometry,
            ST_Centroid(az.geometry)
        ) as distance
    FROM agriculture_zones az
    CROSS JOIN water_bodies wb
    WHERE wb.id = water_body_uuid
        AND ST_DWithin(
            wb.centroid::geometry,
            ST_Centroid(az.geometry),
            buffer_distance_meters
        )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Function to get water body statistics
CREATE OR REPLACE FUNCTION get_water_body_stats(water_body_uuid UUID)
RETURNS TABLE(
    total_measurements INTEGER,
    avg_surface_area DECIMAL,
    avg_ndwi DECIMAL,
    last_measurement_date DATE,
    surface_trend VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_measurements,
        AVG(surface_area_ha)::DECIMAL(10,2) as avg_surface_area,
        AVG(ndwi_average)::DECIMAL(5,3) as avg_ndwi,
        MAX(measurement_date) as last_measurement_date,
        CASE
            WHEN AVG(surface_area_ha) FILTER (WHERE measurement_date >= CURRENT_DATE - 30) >
                 AVG(surface_area_ha) FILTER (WHERE measurement_date >= CURRENT_DATE - 60 AND measurement_date < CURRENT_DATE - 30)
            THEN 'increasing'
            WHEN AVG(surface_area_ha) FILTER (WHERE measurement_date >= CURRENT_DATE - 30) <
                 AVG(surface_area_ha) FILTER (WHERE measurement_date >= CURRENT_DATE - 60 AND measurement_date < CURRENT_DATE - 30)
            THEN 'decreasing'
            ELSE 'stable'
        END as surface_trend
    FROM water_measurements
    WHERE water_body_id = water_body_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- View for water bodies with latest measurements
CREATE OR REPLACE VIEW water_bodies_with_latest AS
SELECT
    wb.id,
    wb.name,
    wb.region,
    wb.type,
    wb.surface_area_ha,
    wb.metadata,
    ST_AsGeoJSON(wb.centroid)::json as centroid_geojson,
    wm.measurement_date as last_measurement_date,
    wm.ndwi_average as last_ndwi,
    wm.surface_area_ha as last_measured_surface,
    wb.created_at,
    wb.updated_at
FROM water_bodies wb
LEFT JOIN LATERAL (
    SELECT *
    FROM water_measurements
    WHERE water_body_id = wb.id
    ORDER BY measurement_date DESC
    LIMIT 1
) wm ON true;

COMMENT ON VIEW water_bodies_with_latest IS 'Water bodies with their most recent measurement';

-- ============================================
-- INITIAL DATA CHECK
-- ============================================

-- Display table counts
DO $$
BEGIN
    RAISE NOTICE 'Schema created successfully!';
    RAISE NOTICE 'Tables created: water_bodies, water_measurements, analysis_results, agriculture_zones, weather_data, alerts';
    RAISE NOTICE 'Run seeds/001_initial_data.sql to populate with data';
END $$;
