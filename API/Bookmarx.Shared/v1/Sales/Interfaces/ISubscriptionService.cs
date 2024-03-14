namespace Bookmarx.Shared.v1.Sales.Interfaces;

public interface ISubscriptionService
{
	Task<Subscription> CreateAccountFreeTrialSubscription();
}