namespace Bookmarx.API.v1.Controllers.Membership;

[ApiController]
[Route("v{version:apiVersion}/membership-auth")]
public class MembershipAuthController : ControllerBase
{
	private readonly IMembershipAuthAppService _authAppService;

	private readonly IMapper _mapper;

	private readonly ISubscriptionValidationService _subscriptionValidationService;

	private readonly ITokenValidatorService _tokenValidatorService;

	public MembershipAuthController(
	IMembershipAuthAppService authAppService,
	IMapper mapper,
	ITokenValidatorService tokenValidatorService,
	ISubscriptionValidationService subscriptionValidationService
	)
	{
		this._authAppService = authAppService;
		this._mapper = mapper;
		this._tokenValidatorService = tokenValidatorService;
		this._subscriptionValidationService = subscriptionValidationService;
	}

	[HttpPost]
	[Route("signup-with-email-and-password")]
	public async Task<IdentityActionResponseDto> CreateNewMemberAccount(MemberAccountCreateRequest memberAccountCreateRequest)
	{
		var response = new IdentityActionResponseDto();

		if (!string.IsNullOrEmpty(memberAccountCreateRequest?.APID)
			&& !string.IsNullOrEmpty(memberAccountCreateRequest?.EmailAddress))
		{
			// Sanitize some stuff
			memberAccountCreateRequest.EmailAddress = memberAccountCreateRequest.EmailAddress.Trim();

			var newMember = this._mapper.Map<MemberAccountDto>(memberAccountCreateRequest);

			if (await this._tokenValidatorService.CheckTokenIsValidAndSetIdentityUser(memberAccountCreateRequest.AccessToken, memberAccountCreateRequest.APID))
			{
				// Finally, create the account
				var newMemberAccount = await this._authAppService.CreateNewMemberAccountMember(newMember);
				response.MemberAccountID = newMemberAccount.MemberAccountID.ToString();

				// To start every user will have 30 days before they will be asked to select a subscription.
				response.IsSubscriptionValid = true;
			}
		}

		return response;
	}

	[HttpPost]
	[Route("sign-in-with-email-and-password")]
	public async Task<IdentityActionResponseDto> SignInWithEmailAndPassword([FromBody] SignInRequestDto signInRequestDto)
	{
		IdentityActionResponseDto identityActionResponseDto = new IdentityActionResponseDto();

		if (!string.IsNullOrEmpty(signInRequestDto.AuthToken) && !string.IsNullOrEmpty(signInRequestDto.AuthProviderUID))
		{
			// Validate the token before updating the last login details
			if (await this._tokenValidatorService.CheckTokenIsValidAndSetIdentityUser(signInRequestDto.AuthToken, signInRequestDto.AuthProviderUID))
			{
				var signedInMemberAccount = await this._authAppService.SignInWithEmailAndPassword(signInRequestDto.AuthProviderUID);

				if (signedInMemberAccount != null)
				{
					identityActionResponseDto.MemberAccountID = signedInMemberAccount?.MemberAccountID;

					// TODO: Swap this out for the new identity user values.
					identityActionResponseDto.IsSubscriptionValid = this._subscriptionValidationService.ValidateSubscription(signedInMemberAccount);
				}
			}
		}

		return identityActionResponseDto;
	}
}