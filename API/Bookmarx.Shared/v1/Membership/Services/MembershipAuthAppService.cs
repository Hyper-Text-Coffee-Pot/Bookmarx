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

	public async Task<MemberAccount> CreateNewMemberAccountMember(MemberAccountDto memberAccountDto)
	{
		// Being very thorough about sanitizing
		memberAccountDto.EmailAddress = memberAccountDto.EmailAddress.Trim();
		MemberAccount newMemberAccount = new MemberAccount(
			memberAccountDto.AuthProviderUID,
			DateTime.UtcNow,
			memberAccountDto.EmailAddress,
			memberAccountDto.FirstName,
			DateTime.UtcNow,
			memberAccountDto.LastName);

		try
		{
			// Do a check for any potential existing member with this email.
			var existingMemberAccountByEmail = await this._firestoreProvider
				.WhereEqualTo<MemberAccount>(nameof(MemberAccount.EmailAddress), newMemberAccount.EmailAddress, CancellationToken.None);

			if (existingMemberAccountByEmail.Any())
			{
				throw new Exception($"Member account already exists with email addres: {newMemberAccount.EmailAddress}");
			}
			else
			{
				// TODO: Create order and subscriptions here.
				// Finally, create a new order and subscription for the new member!
				Order newMemberOrder = await this._orderService.SaveNewAccountFreeTrialOrder(newMemberAccount.MemberAccountID);
				newMemberAccount.Orders.Add(newMemberOrder);

				Subscription subscription = await this._subscriptionService.CreateAccountFreeTrialSubscription();
				newMemberAccount.Subscriptions.Add(subscription);

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

	public async Task<MemberAccount?> SignInWithEmailAndPassword(string authProviderUID)
	{
		MemberAccount? memberAccount = new MemberAccount();

		var currentMember = await this._firestoreProvider
			.WhereEqualTo<MemberAccount>(nameof(MemberAccount.AuthProviderUID), authProviderUID, CancellationToken.None);

		if (currentMember.Any())
		{
			memberAccount = currentMember.FirstOrDefault();

			if (memberAccount != null)
			{
				memberAccount.UpdateLastLoginDateTime();
				await this._firestoreProvider.AddOrUpdateById(memberAccount, CancellationToken.None);
			}
		}

		return memberAccount;
	}

	public async Task<MemberAccount> SignInWithGoogle(MemberAccountDto memberAccountDto)
	{
		var memberAccount = new MemberAccount();

		try
		{
			var existingMember = await this._firestoreProvider
				.WhereEqualTo<MemberAccount>(nameof(MemberAccount.AuthProviderUID), memberAccountDto.AuthProviderUID, CancellationToken.None);

			if (existingMember.Any())
			{
				memberAccount = existingMember.FirstOrDefault();

				// If an account exists then just update the login details
				memberAccount.UpdateLastLoginDateTime();

				//await this._pictyrsDbContext.SaveChangesAsync();
				await this._firestoreProvider.AddOrUpdateById(memberAccount, CancellationToken.None);
			}
			else
			{
				// If no account exists then make one
				memberAccount = await this.CreateNewMemberAccountMember(memberAccountDto);
			}
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Failed to sign in with Google.");
		}

		// Send back the AccountGuid because we'll validate that the save worked
		return memberAccount;
	}
}