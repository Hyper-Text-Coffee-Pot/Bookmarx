namespace Bookmarx.Shared.v1.Sales.Services;

public class SubscriptionService : ISubscriptionService
{
	private readonly ILogger<SubscriptionService> _logger;

	public SubscriptionService(
		ILogger<SubscriptionService> logger)
	{
		this._logger = logger;
	}

	public async Task<Subscription> CreateAccountFreeTrialSubscription()
	{
		var dummyProviderSubscriptionID = this.GenerateFreeProviderSubscriptionID();

		Subscription freeTrialSubscription = new Subscription(DateTime.UtcNow, "FREETRIAL", dummyProviderSubscriptionID);

		return freeTrialSubscription;
	}

	/// <summary>
	/// The ProviderTransactionID is required so just supply a dummy free_ style one.
	/// This is probably total overkill, but hey. It's neat.
	/// https://briancaos.wordpress.com/2022/02/24/c-datetime-to-unix-timestamps/
	/// </summary>
	/// <returns></returns>
	private string GenerateFreeProviderSubscriptionID()
	{
		string guidWithoutDashes = Guid.NewGuid().ToString("N");
		DateTimeOffset dto = new DateTimeOffset(DateTime.UtcNow);
		string unixTime = dto.ToUnixTimeSeconds().ToString();
		string dummyProviderSubscriptionID = $"free_{guidWithoutDashes}_{unixTime}";
		return dummyProviderSubscriptionID;
	}
}