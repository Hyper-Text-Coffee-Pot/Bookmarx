namespace Bookmarx.API.v1.Controllers.Membership.Models;

public class SignInRequestDto
{
	public string AuthProviderUID { get; set; }

	public string AuthToken { get; set; }

	//public string ReCAPTCHAToken { get; set; }
}