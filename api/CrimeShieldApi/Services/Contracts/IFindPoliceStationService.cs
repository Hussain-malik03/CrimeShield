using CrimeShieldApi.DTOs;

namespace CrimeShieldApi.Services.Contracts
{
    public interface IFindPoliceStationService
    {
        Task<CheckPointResult> CheckBoundariesAsync(double latitude, double longitude);

    }
}
