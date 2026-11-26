using System.Threading.Tasks;
using GymPlatform.Contracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Messaging.Consumers;

/// <summary>
/// Consumes <see cref="MemberRegisteredV1"/> events published by the Members service.
/// </summary>
public sealed class MemberRegisteredConsumer : IConsumer<MemberRegisteredV1>
{
    private readonly ILogger<MemberRegisteredConsumer> _logger;

    public MemberRegisteredConsumer(ILogger<MemberRegisteredConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<MemberRegisteredV1> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Received MemberRegisteredV1 (EventId: {EventId}): Member {MemberId} ({MemberCode}, {FullName}) registered in Gym {GymId}",
            message.EventId,
            message.MemberId,
            message.MemberCode,
            message.FullName,
            message.GymId);

        return Task.CompletedTask;
    }
}
