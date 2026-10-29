CREATE TABLE PoliceStation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    contact VARCHAR(100),
	address VARCHAR(250),
    geom GEOMETRY(POLYGON, 4326)
);

