using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Authentication;

namespace Identity.Infrastructure.Messaging.Configuration;

public static class MessagingExtensions
{
    public static IServiceCollection AddMessaging(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var rabbitMq = configuration.GetSection("RabbitMQ");

        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(
                    rabbitMq["Host"]!,
                    rabbitMq.GetValue<ushort>("Port"),
                    rabbitMq["VirtualHost"]!,
                    h =>
                    {
                        h.Username(rabbitMq["Username"]!);
                        h.Password(rabbitMq["Password"]!);

                        h.UseSsl(s =>
                        {
                            s.Protocol = SslProtocols.Tls12;
                        });
                    });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
