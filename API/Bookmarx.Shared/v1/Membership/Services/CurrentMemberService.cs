namespace Bookmarx.Shared.v1.Membership.Services;

public class CurrentMemberService : ICurrentMemberService
{
	private readonly IMemoryCache _cache;

	private readonly FirestoreProvider _firestoreProvider;

	private readonly IHttpContextAccessor _httpContextAccessor;

	private readonly ILogger<CurrentMemberService> _logger;

	public CurrentMemberService(
		ILogger<CurrentMemberService> logger,
		FirestoreProvider firestoreProvider,
		IHttpContextAccessor httpContextAccessor,
		IMemoryCache cache)
	{
		this._logger = logger ?? throw new ArgumentNullException(nameof(logger));
		this._firestoreProvider = firestoreProvider ?? throw new ArgumentNullException(nameof(firestoreProvider));
		this._httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
		this._cache = cache ?? throw new ArgumentNullException(nameof(cache));
	}

	public string? AccountId
	{
		get
		{
			var accountId = this._httpContextAccessor.HttpContext.User.FindFirst("AccountId");
			if (accountId != null)
			{
				return accountId.Value;
			}
			else
			{
				throw new Exception("Request failed.");
			}
		}
	}

	public async Task<MemberAccount?> GetCachedMember()
	{
		var cacheKey = $"MemberAccount_{AccountId}";

		if (this._cache.TryGetValue(cacheKey, out MemberAccount? currentMemberAccount))
		{
			return currentMemberAccount;
		}

		if (!string.IsNullOrEmpty(this.AccountId))
		{
			var members = await this._firestoreProvider
				.WhereEqualTo<MemberAccount>(nameof(MemberAccount.Id), this.AccountId, CancellationToken.None);

			if (members != null)
			{
				currentMemberAccount = members.FirstOrDefault();
				this._cache.Set(cacheKey, currentMemberAccount, TimeSpan.FromMinutes(10));
			}
		}
		else
		{
			throw new Exception("Request failed.");
		}

		return currentMemberAccount;
	}

	public async Task<MemberAccount?> GetFreshMember()
	{
		var currentMemberAccount = new MemberAccount();

		if (!string.IsNullOrEmpty(this.AccountId))
		{
			var members = await this._firestoreProvider
				.WhereEqualTo<MemberAccount>(nameof(MemberAccount.Id), this.AccountId, CancellationToken.None);

			if (members != null)
			{
				currentMemberAccount = members.FirstOrDefault();
			}
		}
		else
		{
			throw new Exception("Request failed.");
		}

		return currentMemberAccount;
	}
}