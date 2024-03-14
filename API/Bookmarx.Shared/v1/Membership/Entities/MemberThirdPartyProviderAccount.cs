using Google.Cloud.Firestore;

namespace Bookmarx.Shared.v1.Membership.Entities;

[FirestoreData]
public class MemberThirdPartyProviderAccount
{
	public MemberThirdPartyProviderAccount(
		int memberAccountID,
		string thirdPartyProviderCustomerID,
		ThirdPartyProviderType thirdPartyProviderTypeID)
	{
		this.MemberAccountID = memberAccountID;
		this.ThirdPartyProviderCustomerID = thirdPartyProviderCustomerID;
		this.ThirdPartyProviderTypeID = (int)thirdPartyProviderTypeID;
	}

	private MemberThirdPartyProviderAccount()
	{
		// Needed for EF
	}

	[FirestoreProperty]
	public MemberAccount MemberAccount { get; private set; }

	[FirestoreProperty]
	public int MemberAccountID { get; private set; }

	[FirestoreProperty]
	public int MemberThirdPartyProviderAccountID { get; private set; }

	[FirestoreProperty]
	public string ThirdPartyProviderCustomerID { get; private set; }

	[FirestoreProperty]
	public int ThirdPartyProviderTypeID { get; private set; }
}