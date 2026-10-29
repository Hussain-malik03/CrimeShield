using CrimeShieldApi.Data;
using CrimeShieldApi.Services;
using CrimeShieldApi.Services.Contracts;
using CrimeShieldApi.Services.Implementations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<CrimeShieldDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    )
);
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()    // Allow requests from all origins
              .AllowAnyMethod()    // Allow any HTTP method (GET, POST, etc.)
              .AllowAnyHeader();   // Allow any HTTP header
    });
});

builder.Services.AddScoped<IFindPoliceStationService, FindPoliceStationService>();

builder.Services.AddSingleton<CrimeShieldDapperDbContext>();
builder.Services.AddScoped<GraphHopperService>();
builder.Services.AddScoped<RouteService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();

app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
