using Bookmarx.Shared.v1.ThirdParty.Google.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bookmarx.API.v1.Controllers.Membership;

[ApiController]
[Route("v{version:apiVersion}/membership-auth")]
public class MembershipAuthController : ControllerBase
{
	private readonly IReCAPTCHAService _reCAPTCHAService;

	// TODO: Pickup here
	//public MembershipAuthController(
	//IMembershipAuthAppService authAppService,
	//IMapper mapper,
	//ITokenValidatorService tokenValidatorService,
	//IContactInvitationAppService contactInvitationAppService,
	//IReCAPTCHAService reCAPTCHAService,
	//ISubscriptionValidationService subscriptionValidationService
	//)
	//{
	//	this._authAppService = authAppService;
	//	this._mapper = mapper;
	//	this._tokenValidatorService = tokenValidatorService;
	//	this._contactInvitationAppService = contactInvitationAppService;
	//	this._reCAPTCHAService = reCAPTCHAService;
	//	this._subscriptionValidationService = subscriptionValidationService;
	//}

	//[HttpPost]
	//[Route("signup-with-email-and-password")]
	//public async Task<IdentityActionResponseDto> CreateNewMemberAccount(MemberAccountCreateRequest memberAccountCreateRequest)
	//{
	//	var response = new IdentityActionResponseDto();

	//	try
	//	{
	//		// Do something with this at a later point
	//		// Wrapping it in a try catch cuz I don't want the rest to fail
	//		var siteVerifyResponse = await this._reCAPTCHAService.VerifyReCAPTCHAToken(memberAccountCreateRequest.ReCAPTCHAToken);
	//	}
	//	catch (Exception ex)
	//	{
	//		// Do nothing for now
	//	}

	//	if (!string.IsNullOrEmpty(memberAccountCreateRequest?.APID)
	//		&& !string.IsNullOrEmpty(memberAccountCreateRequest?.EmailAddress))
	//	{
	//		// Sanitize some stuff
	//		memberAccountCreateRequest.EmailAddress = memberAccountCreateRequest.EmailAddress.Trim();
	//		var newMember = this._mapper.Map<MemberAccountDto>(memberAccountCreateRequest);

	//		if (await this._tokenValidatorService.CheckTokenIsValidAndSetIdentityUser(memberAccountCreateRequest.AccessToken, memberAccountCreateRequest.APID))
	//		{
	//			// Finally, create the account
	//			var newMemberAccount = await this._authAppService.CreateNewMemberAccountMember(newMember, memberAccountCreateRequest.IG);
	//			response.OGID = newMemberAccount.AccountGuid.ToString();

	//			// To start every user will have 30 days before they will be asked to select a subscription.
	//			response.IsSubscriptionValid = true;
	//		}
	//	}

	//	return response;
	//}
}