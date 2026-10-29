using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;

namespace CrimeShieldApi.Models
{
    public class PoliceStation
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }
        public string contact { get; set; }
        public string address { get; set; }
        public Geometry Geom { get; set; }
    }
}
