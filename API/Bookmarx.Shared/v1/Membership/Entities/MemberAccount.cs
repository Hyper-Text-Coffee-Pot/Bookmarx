using Bookmarx.Data.v1.Interfaces;
using Bookmarx.Shared.v1.Bookmarks.Entities;
using Google.Cloud.Firestore;

namespace Bookmarx.Shared.v1.Membership.Entities;

[FirestoreData]
public class MemberAccount : IFirebaseEntity
{
	public MemberAccount()
	{
		// Needed for firebase
	}

	public MemberAccount(
		string authProviderUID,
		DateTime createdDateTimeUTC,
		string emailAddress,
		string firstName,
		DateTime lastLoginDateTimeUTC,
		string lastName)
	{
		this.Id = Guid.NewGuid().ToString("N");
		this.AuthProviderUID = authProviderUID;
		this.CreatedDateTimeUTC = createdDateTimeUTC;
		this.EmailAddress = emailAddress;
		this.FirstName = firstName;
		this.LastLoginDateTimeUTC = lastLoginDateTimeUTC;
		this.LastName = lastName;
	}

	[FirestoreProperty]
	public string AuthProviderUID { get; set; }

	[FirestoreProperty]
	public List<BookmarkCollection> BookmarkCollections { get; set; } = new List<BookmarkCollection>();

	/// <summary>
	/// Convert using the {DateTime:O} when setting to append timezone info for UTC and ISO-8601.
	/// </summary>
	[FirestoreProperty]
	public DateTime CreatedDateTimeUTC { get; set; }

	[FirestoreProperty]
	public string EmailAddress { get; set; }

	[FirestoreProperty]
	public string? FirstName { get; set; }

	public string FullName
	{
		get
		{
			return $"{this.FirstName} {this.LastName}";
		}

		private set { }
	}

	[FirestoreProperty]
	public string Id { get; set; }

	/// <summary>
	/// Convert using the {DateTime:O} when setting to append timezone info for UTC and ISO-8601.
	/// </summary>
	[FirestoreProperty]
	public DateTime? LastLoginDateTimeUTC { get; set; }

	[FirestoreProperty]
	public string? LastName { get; set; }

	[FirestoreProperty]
	public string MemberAccountID
	{
		get
		{
			return this.Id;
		}
	}

	[FirestoreProperty]
	public List<MemberThirdPartyProviderAccount> MemberThirdPartyProviders { get; private set; } = new List<MemberThirdPartyProviderAccount>();

	[FirestoreProperty]
	public List<Order> Orders { get; private set; } = new List<Order>();

	[FirestoreProperty]
	public List<Subscription> Subscriptions { get; private set; } = new List<Subscription>();

	public void AddOrder(Order order)
	{
		this.Orders.Add(order);
	}

	public void AddSubscription(Subscription subscription)
	{
		this.Subscriptions.Add(subscription);
	}

	public void UpdateLastLoginDateTime()
	{
		this.LastLoginDateTimeUTC = DateTime.UtcNow;
	}
}