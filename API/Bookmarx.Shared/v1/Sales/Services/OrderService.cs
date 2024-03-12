namespace Bookmarx.Shared.v1.Sales.Services;

public class OrderService : IOrderService
{
	private readonly ILogger<OrderService> _logger;

	public OrderService(
		ILogger<OrderService> logger)
	{
		this._logger = logger;
	}

	public async Task<Order> SaveNewAccountFreeTrialOrder(string newMemberAccountID)
	{
		string orderGuid = Guid.NewGuid().ToString();
		Order freeTrialOrder = new Order(true, DateTime.UtcNow, orderGuid);

		try
		{
			OrderProduct freeTrialOrderProduct = new OrderProduct("FREETRIAL", 1);
			freeTrialOrder.AddOrderProduct(freeTrialOrderProduct);
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Failed to save new account free trial order.");
		}

		return freeTrialOrder;
	}
}