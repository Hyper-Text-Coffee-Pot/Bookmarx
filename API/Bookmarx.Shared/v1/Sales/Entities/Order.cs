using Google.Cloud.Firestore;

namespace Bookmarx.Shared.v1.Sales.Entities;

[FirestoreData]
public class Order
{
	public Order(
		bool emailConfirmationSent,
		DateTime orderDateTime,
		string orderGuid)
	{
		this.EmailConfirmationSent = emailConfirmationSent;
		this.OrderDateTimeUTC = orderDateTime;
		this.OrderGuid = orderGuid;
	}

	private Order()
	{
		// Needed for Firebase
	}

	[FirestoreProperty]
	public bool EmailConfirmationSent { get; private set; }

	[FirestoreProperty]
	public DateTime OrderDateTimeUTC { get; private set; }

	[FirestoreProperty]
	public string OrderGuid { get; private set; }

	public List<OrderProduct> OrderProducts { get; private set; } = new List<OrderProduct>();

	public List<SalesTransaction> Transactions { get; private set; } = new List<SalesTransaction>();

	public void AddOrderProduct(OrderProduct product)
	{
		this.OrderProducts.Add(product);
	}
}