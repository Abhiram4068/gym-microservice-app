using System;
using System.Threading;
using System.Threading.Tasks;

namespace Identity.Application.Interfaces.Repositories;

/// <summary>
/// Coordinates atomic database transactions across multiple repository operations.
/// </summary>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> operation, CancellationToken cancellationToken = default);
}
