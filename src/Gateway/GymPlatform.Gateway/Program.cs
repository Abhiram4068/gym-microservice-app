using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

// Ensure every proxied request carries an X-Correlation-ID header
app.Use(async (context, next) =>
{
    const string headerName = "X-Correlation-ID";
    if (!context.Request.Headers.TryGetValue(headerName, out var correlationId) ||
        string.IsNullOrWhiteSpace(correlationId))
    {
        correlationId = Guid.NewGuid().ToString("D");
        context.Request.Headers[headerName] = correlationId;
    }

    context.Response.OnStarting(() =>
    {
        context.Response.Headers[headerName] = correlationId.ToString();
        return Task.CompletedTask;
    });

    await next();
});

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "GymPlatform.Gateway" }));
app.MapReverseProxy();

app.Run();
