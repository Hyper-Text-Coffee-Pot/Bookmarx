using Bookmarx.Data.v1.Interfaces;
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
		this.CreatedDateTimeUTC = createdDateTimeUTC.ToString("O");
		this.EmailAddress = emailAddress;
		this.FirstName = firstName;
		this.LastLoginDateTimeUTC = lastLoginDateTimeUTC.ToString("O");
		this.LastName = lastName;
	}

	[FirestoreProperty]
	public string AuthProviderUID { get; set; }

	/// <summary>
	/// Convert using the {DateTime:O} when setting to append timezone info for UTC and ISO-8601.
	/// </summary>
	[FirestoreProperty]
	public string CreatedDateTimeUTC { get; set; }

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

	public string Id { get; set; }

	/// <summary>
	/// Convert using the {DateTime:O} when setting to append timezone info for UTC and ISO-8601.
	/// </summary>
	[FirestoreProperty]
	public string? LastLoginDateTimeUTC { get; set; }

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

	public List<MemberThirdPartyProviderAccount> MemberThirdPartyProviders { get; set; } = new List<MemberThirdPartyProviderAccount>();

	public List<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}