using System.Threading;
using System.Threading.Tasks;

namespace GymPlatform.Common.Messaging;

/// <summary>
/// Abstraction for publishing integration events without coupling Application layers to MassTransit.
/// </summary>
public interface IEventBus
{
    Task PublishAsync<TEvent>(TEvent message, CancellationToken cancellationToken = default)
        where TEvent : class;
}
