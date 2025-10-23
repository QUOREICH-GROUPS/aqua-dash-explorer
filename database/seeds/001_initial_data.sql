-- ============================================
-- Initial Data for SmartWaterWatch
-- Water bodies and agriculture zones for Burkina Faso
-- ============================================

-- Clear existing data (be careful in production!)
TRUNCATE TABLE water_measurements CASCADE;
TRUNCATE TABLE analysis_results CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE agriculture_zones CASCADE;
TRUNCATE TABLE water_bodies CASCADE;

-- ============================================
-- INSERT WATER BODIES
-- ============================================

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

-- ============================================
-- INSERT AGRICULTURE ZONES
-- ============================================

INSERT INTO agriculture_zones (name, region, crop_type, geometry, surface_ha, average_yield, irrigation_type) VALUES
('Zone Maïs Centre', 'Centre', 'Maïs',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-1.7 12.5, -1.3 12.5, -1.3 12.1, -1.7 12.1, -1.7 12.5)')), 4326),
 12500, 2.8, 'pluviale'),

('Zone Coton Est', 'Est', 'Coton',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(0.2 11.5, 1.2 11.5, 1.2 11.0, 0.2 11.0, 0.2 11.5)')), 4326),
 15200, 1.8, 'pluviale'),

('Zone Riz Hauts-Bassins', 'Hauts-Bassins', 'Riz',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-4.8 11.4, -4.0 11.4, -4.0 10.8, -4.8 10.8, -4.8 11.4)')), 4326),
 8900, 3.2, 'irrigué'),

('Zone Mil Centre-Nord', 'Centre-Nord', 'Mil',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-2.0 13.5, -1.0 13.5, -1.0 12.8, -2.0 12.8, -2.0 13.5)')), 4326),
 18700, 1.2, 'pluviale'),

('Zone Sorgho Sud-Ouest', 'Sud-Ouest', 'Sorgho',
 ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-3.5 11.2, -2.5 11.2, -2.5 10.5, -3.5 10.5, -3.5 11.2)')), 4326),
 10300, 1.5, 'pluviale');

-- ============================================
-- GENERATE HISTORICAL MEASUREMENTS
-- Last 90 days with realistic variations
-- ============================================

INSERT INTO water_measurements (water_body_id, measurement_date, surface_area_ha, ndwi_average, ndwi_min, ndwi_max, source, confidence_score)
SELECT
    wb.id,
    (CURRENT_DATE - (n || ' days')::interval)::date as measurement_date,
    -- Surface area with seasonal variation (dry season = smaller)
    ROUND((wb.surface_area_ha * (
        1 +
        (CASE WHEN EXTRACT(MONTH FROM (CURRENT_DATE - (n || ' days')::interval)) BETWEEN 11 AND 4
         THEN -0.15  -- Dry season: -15%
         ELSE 0.05   -- Rainy season: +5%
         END) +
        (random() * 0.08 - 0.04)  -- Daily variation ±4%
    ))::numeric, 2) as surface_area_ha,
    -- NDWI with similar pattern
    ROUND(((wb.metadata->>'ndwi')::numeric * (
        1 +
        (CASE WHEN EXTRACT(MONTH FROM (CURRENT_DATE - (n || ' days')::interval)) BETWEEN 11 AND 4
         THEN -0.10  -- Dry season: lower NDWI
         ELSE 0.05   -- Rainy season: higher NDWI
         END) +
        (random() * 0.06 - 0.03)  -- Daily variation ±3%
    ))::numeric, 3) as ndwi_average,
    -- NDWI min/max
    ROUND(((wb.metadata->>'ndwi')::numeric * 0.85)::numeric, 3) as ndwi_min,
    ROUND(((wb.metadata->>'ndwi')::numeric * 1.15)::numeric, 3) as ndwi_max,
    CASE
        WHEN n % 7 = 0 THEN 'satellite'  -- Satellite every 7 days
        ELSE 'model'  -- Model predictions for other days
    END as source,
    CASE
        WHEN n % 7 = 0 THEN ROUND((0.85 + random() * 0.15)::numeric, 2)  -- Satellite: 85-100%
        ELSE ROUND((0.70 + random() * 0.20)::numeric, 2)  -- Model: 70-90%
    END as confidence_score
FROM water_bodies wb
CROSS JOIN generate_series(0, 89) AS n;

-- ============================================
-- CREATE SAMPLE ALERTS
-- ============================================

-- Critical alerts for water bodies with low levels
INSERT INTO alerts (water_body_id, alert_type, severity, title, message, is_active)
SELECT
    id,
    'Niveau critique',
    'critical',
    'Niveau d''eau critique détecté',
    'Le niveau d''eau a baissé de ' || (metadata->>'variation')::text || '% ce mois-ci. Irrigation compromise.',
    true
FROM water_bodies
WHERE (metadata->>'status')::text = 'critical';

-- Warning alerts
INSERT INTO alerts (water_body_id, alert_type, severity, title, message, is_active)
SELECT
    id,
    'Baisse significative',
    'high',
    'Baisse du niveau d''eau',
    'Baisse de ' || ABS((metadata->>'variation')::numeric) || '% observée. Surveillance recommandée.',
    true
FROM water_bodies
WHERE (metadata->>'status')::text = 'warning'
  AND (metadata->>'variation')::numeric < -2;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    wb_count INTEGER;
    wm_count INTEGER;
    az_count INTEGER;
    alert_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO wb_count FROM water_bodies;
    SELECT COUNT(*) INTO wm_count FROM water_measurements;
    SELECT COUNT(*) INTO az_count FROM agriculture_zones;
    SELECT COUNT(*) INTO alert_count FROM alerts;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Data seeding completed successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Water bodies inserted: %', wb_count;
    RAISE NOTICE 'Measurements inserted: %', wm_count;
    RAISE NOTICE 'Agriculture zones inserted: %', az_count;
    RAISE NOTICE 'Alerts created: %', alert_count;
    RAISE NOTICE '========================================';
END $$;

-- Display sample data
SELECT
    name,
    region,
    type,
    surface_area_ha || ' ha' as surface,
    metadata->>'status' as status
FROM water_bodies
ORDER BY surface_area_ha DESC;
