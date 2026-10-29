CREATE TABLE CrimeRecords (
    CrimeID SERIAL PRIMARY KEY,
    CrimeType VARCHAR(100) NOT NULL,
    CrimeSeverity VARCHAR(50),
    Latitude FLOAT NOT NULL,
    Longitude FLOAT NOT NULL,
    LocationDescription VARCHAR(255),
    DateTime TIMESTAMP,  
    ReportedBy VARCHAR(255),
    CrimeStatus VARCHAR(50),
    Radius INT
);