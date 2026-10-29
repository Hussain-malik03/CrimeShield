using CrimeShieldApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CrimeShieldApi.Data
{
    public class CrimeShieldDbContext : DbContext
    {
        public CrimeShieldDbContext(DbContextOptions<CrimeShieldDbContext> options) : base(options)
        {
        }

        public DbSet<PoliceStation> PoliceStations { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PoliceStation>()
                .ToTable("PoliceStation") 
                .Property(b => b.Geom)
                .HasColumnType("geometry"); 

            modelBuilder.Entity<PoliceStation>()
                .Property(b => b.Name)
                .HasColumnName("name");

        }
    }
}

