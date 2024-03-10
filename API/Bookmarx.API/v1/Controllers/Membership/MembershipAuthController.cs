using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bookmarx.API.v1.Controllers.Membership;

[ApiController]
[Route("v{version:apiVersion}/membership-auth")]
public class MembershipAuthController : ControllerBase
{
}