namespace GymPlatform.Common.Pagination;

/// <summary>
/// Shared pagination normalization helpers to enforce consistent bounds across services.
/// </summary>
public static class PaginationHelper
{
    public static (int PageNumber, int PageSize) Normalize(
        int pageNumber,
        int pageSize,
        int defaultPageSize = 10,
        int maxPageSize = 100)
    {
        var normalizedPage = pageNumber < 1 ? 1 : pageNumber;
        var normalizedSize = pageSize < 1
            ? defaultPageSize
            : (pageSize > maxPageSize ? maxPageSize : pageSize);

        return (normalizedPage, normalizedSize);
    }
}
