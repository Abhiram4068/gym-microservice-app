using GymPlatform.Messaging;
using Identity.Infrastructure.Messaging.Consumers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddGymMessaging(configuration, x =>
        {
            x.AddConsumer<MemberRegisteredConsumer>();
        });

        return services;
    }
}
