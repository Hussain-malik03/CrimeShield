namespace CrimeShieldApi.Models
{
    public class CrimeRecord
    {
        public string CrimeType { get; set; }
        public string CrimeSeverity { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string LocationDescription { get; set; }
        public DateTime DateTime { get; set; }
        public string ReportedBy { get; set; }
        public string CrimeStatus { get; set; }
        public int Radius { get; set; }  // Radius in meters
    }
}
