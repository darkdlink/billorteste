-- Create necessary tables
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    rating DECIMAL(3,2),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loads (
    id SERIAL PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    eta TIMESTAMP NOT NULL,
    source VARCHAR(50) NOT NULL, -- Which loadboard source
    external_id VARCHAR(100), -- ID from the source
    driver_id INTEGER REFERENCES drivers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    load_id INTEGER REFERENCES loads(id),
    summary_text TEXT NOT NULL,
    insights JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_loads_origin ON loads(origin);
CREATE INDEX idx_loads_destination ON loads(destination);
CREATE INDEX idx_loads_price ON loads(price);
CREATE INDEX idx_loads_eta ON loads(eta);
CREATE INDEX idx_loads_source ON loads(source);
CREATE INDEX idx_summaries_load_id ON summaries(load_id);

-- Create materialized view
CREATE MATERIALIZED VIEW load_summaries AS
SELECT 
    l.id as load_id,
    l.origin,
    l.destination,
    l.price,
    l.eta,
    l.source,
    s.id as summary_id,
    s.summary_text,
    s.insights,
    s.created_at as summary_created_at
FROM 
    loads l
JOIN 
    summaries s ON l.id = s.load_id;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_load_summaries_load_id ON load_summaries(load_id);
CREATE INDEX idx_load_summaries_price ON load_summaries(price);
CREATE INDEX idx_load_summaries_source ON load_summaries(source);

-- Function to get top 5 loads with best insights
CREATE OR REPLACE FUNCTION get_top_loads_with_insights()
RETURNS TABLE (
    load_id INTEGER,
    origin VARCHAR(100),
    destination VARCHAR(100),
    price DECIMAL(10,2),
    eta TIMESTAMP,
    source VARCHAR(50),
    summary_text TEXT,
    insights JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.load_id,
        ls.origin,
        ls.destination,
        ls.price,
        ls.eta,
        ls.source,
        ls.summary_text,
        ls.insights
    FROM 
        load_summaries ls
    ORDER BY 
        ls.price DESC, 
        ls.summary_created_at DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;