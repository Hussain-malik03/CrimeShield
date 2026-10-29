namespace CrimeShieldApi.DTOs
{
    public class CheckPointResult
    {
        public double CurrentLatitude { get; set; }
        public double CurrentLongitude { get; set; }
        public string PoliceStationName { get; set; }
        public string ContactNumber { get; set; }
        public string Address { get; set; }
    }
}
