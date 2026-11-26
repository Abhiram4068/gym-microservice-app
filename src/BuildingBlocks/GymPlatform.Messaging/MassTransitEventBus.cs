using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Messaging;
using MassTransit;

namespace GymPlatform.Messaging;

internal sealed class MassTransitEventBus : IEventBus
{
    private readonly IPublishEndpoint _publishEndpoint;

    public MassTransitEventBus(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task PublishAsync<TEvent>(TEvent message, CancellationToken cancellationToken = default)
        where TEvent : class
    {
        return _publishEndpoint.Publish(message, cancellationToken);
    }
}
