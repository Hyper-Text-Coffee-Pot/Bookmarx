using Bookmarx.Shared.v1.Identity.Interfaces;
using Bookmarx.Shared.v1.Identity.Services;
using Bookmarx.Shared.v1.ThirdParty.Google.Interfaces;
using Bookmarx.Shared.v1.ThirdParty.Google.Services;

namespace Bookmarx.API.v1.Extensions;

public static class ServiceCollectionExtensions
{
	/// <summary>
	/// https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-5.0#code-try-4
	/// Register ALL custom DI dependencies here.
	/// </summary>
	/// <param name="services"></param>
	/// <param name="configuration"></param>
	/// <returns></returns>
	public static IServiceCollection RegisterCustomDependencies(this IServiceCollection services, IConfiguration configuration)
	{
		services.AddScoped<ITokenValidatorService, GoogleFirebaseTokenValidatorService>();
		services.AddScoped<IReCAPTCHAService, ReCAPTCHAService>();

		return services;
	}
}