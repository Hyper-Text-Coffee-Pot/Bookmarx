using Bookmarx.Data.v1.Providers;

namespace Bookmarx.Shared.v1.Membership.Services;

public class MembershipAuthAppService : IMembershipAuthAppService
{
	private readonly FirestoreProvider _firestoreProvider;

	private readonly ILogger<MembershipAuthAppService> _logger;

	private readonly IMapper _mapper;

	private readonly IOrderService _orderService;

	private readonly ISubscriptionService _subscriptionService;

	public MembershipAuthAppService(
		IMapper _mapper,
		IOrderService orderService,
		ISubscriptionService subscriptionService,
		ILogger<MembershipAuthAppService> logger,
		FirestoreProvider firestoreProvider)
	{
		this._mapper = _mapper;
		this._orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
		this._subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
		this._logger = logger;
		this._firestoreProvider = firestoreProvider;
	}

	public async Task<MemberAccount> CreateNewMemberAccountMember(MemberAccountDto memberAccount, int retryCount = 0)
	{
		// Being very thorough about sanitizing
		memberAccount.EmailAddress = memberAccount.EmailAddress.Trim();
		MemberAccount newMemberAccount = new MemberAccount(
			memberAccount.AuthProviderUID,
			DateTime.UtcNow,
			memberAccount.EmailAddress,
			memberAccount.FirstName,
			DateTime.UtcNow,
			memberAccount.LastName);

		try
		{
			// Do a check for any potential existing member with this id.
			MemberAccount existingMemberAccountById = await this._firestoreProvider.Get<MemberAccount>(newMemberAccount.Id, CancellationToken.None);
			var existingMemberAccountByEmail = await this._firestoreProvider.WhereEqualTo<MemberAccount>(nameof(MemberAccount.EmailAddress), newMemberAccount.EmailAddress, CancellationToken.None);

			// TODO: Need to handle the scenario where a member account already exists.
			if (existingMemberAccountById != null)
			{
				throw new Exception($"Member account with id {newMemberAccount.Id} already exists.");
			}
			else if (existingMemberAccountByEmail.Any())
			{
				throw new Exception($"Member account already exists with email addres: {newMemberAccount.EmailAddress}");
			}
			else
			{
				// TODO: Create order and subscriptions here.
				// Finally, create a new order and subscription for the new member!
				//Order newMemberOrder = await this._orderService.SaveNewAccountFreeTrialOrder(newMemberAccount.MemberAccountID);
				//await this._subscriptionService.SaveAccountFreeTrialSubscription(newMemberAccount.MemberAccountID);

				await this._firestoreProvider.Create(newMemberAccount, CancellationToken.None);
			}
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Failed to create new member account.");
		}

		// Send back the AccountGuid because we'll validate that the save worked
		return newMemberAccount;
	}

	public List<MemberAccount> GetMembers()
	{
		// TODO: Wire this up
		//return this._pictyrsDbContext.MemberAccounts.ToList();
		return new List<MemberAccount>();
	}

	public MemberAccount SignInWithEmailAndPassword(string authProviderUID)
	{
		MemberAccount memberAccount = new MemberAccount();

		MemberAccount currentMember = null;

		//var currentMember = this._pictyrsDbContext.MemberAccounts
		//	.Include(ma => ma.Subscriptions)
		//	.SingleOrDefault(ma => ma.AuthProviderUID == authProviderUID);

		if (!string.IsNullOrEmpty(currentMember?.MemberAccountID))
		{
			currentMember.LastLoginDateTimeUTC = DateTime.UtcNow.ToString("O");

			//this._pictyrsDbContext.SaveChanges();
			memberAccount = currentMember;
		}

		return memberAccount;
	}

	public async Task<MemberAccount> SignInWithGoogle(MemberAccountDto memberAccountDto)
	{
		var memberAccount = this._mapper.Map<MemberAccount>(memberAccountDto);

		try
		{
			MemberAccount existingMember = null;

			//var existingMember = this._pictyrsDbContext.MemberAccounts
			//	.Include(ma => ma.Subscriptions)
			//	.SingleOrDefault(member => member.AuthProviderUID == memberAccount.AuthProviderUID);

			//if (existingMember?.MemberAccountID > 0)
			//{
			//	// If an account exists then just update the login details
			//	existingMember.LastLoginDateTimeUTC = DateTime.UtcNow;

			//	//await this._pictyrsDbContext.SaveChangesAsync();

			//	memberAccount = existingMember;
			//}
			//else
			//{
			//	// If no account exists then make one
			//	// Upon creation setup the date time here cuz db is goofy
			//	var dateTimeUTCNow = DateTime.UtcNow;
			//	memberAccount.CreatedDateTimeUTC = dateTimeUTCNow;
			//	memberAccount.LastLoginDateTimeUTC = dateTimeUTCNow;

			//	//this._pictyrsDbContext.MemberAccounts.Add(memberAccount);

			//	//await this._pictyrsDbContext.SaveChangesAsync();

			//	// Finally, create a new order and subscription for the new member!
			//	Order newMemberOrder = await this._orderService.SaveNewAccountFreeTrialOrder(memberAccount.MemberAccountID);
			//	await this._subscriptionService.SaveAccountFreeTrialSubscription(memberAccount.MemberAccountID);
			//}
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Failed to sign in with Google.");
		}

		// Send back the AccountGuid because we'll validate that the save worked
		return memberAccount;
	}
}