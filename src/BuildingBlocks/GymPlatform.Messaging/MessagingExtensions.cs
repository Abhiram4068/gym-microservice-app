using System;
using System.Security.Authentication;
using GymPlatform.Common.Messaging;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymPlatform.Messaging;

/// <summary>
/// Shared MassTransit + RabbitMQ registration for all GymPlatform microservices.
/// </summary>
public static class MessagingExtensions
{
    public static IServiceCollection AddGymMessaging(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<IBusRegistrationConfigurator>? configure = null)
    {
        var rabbitMq = configuration.GetSection("RabbitMQ");

        var host = rabbitMq["Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException(
                "RabbitMQ:Host must be configured via dotnet user-secrets or environment variables.");
        }

        var port = rabbitMq.GetValue<ushort?>("Port") ?? 5671;
        var virtualHost = rabbitMq["VirtualHost"] ?? "/";
        var username = rabbitMq["Username"];
        var password = rabbitMq["Password"];

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "RabbitMQ:Username and RabbitMQ:Password must be configured via dotnet user-secrets or environment variables.");
        }

        var useSsl = rabbitMq.GetValue<bool?>("UseSsl") ?? (port == 5671);

        services.AddMassTransit(x =>
        {
            configure?.Invoke(x);

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(host, port, virtualHost, h =>
                {
                    h.Username(username);
                    h.Password(password);

                    if (useSsl)
                    {
                        h.UseSsl(s =>
                        {
                            s.Protocol = SslProtocols.Tls12;
                        });
                    }
                });

                cfg.UseMessageRetry(r =>
                    r.Exponential(
                        retryLimit: 3,
                        minInterval: TimeSpan.FromSeconds(1),
                        maxInterval: TimeSpan.FromSeconds(10),
                        intervalDelta: TimeSpan.FromSeconds(2)));

                cfg.ConfigureEndpoints(context);
            });
        });

        services.AddScoped<IEventBus, MassTransitEventBus>();

        return services;
    }
}
