using Asp.Versioning;
using Asp.Versioning.Conventions;
using Bookmarx.Shared.v1.Configuration.Models;

internal class Program
{
	private static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		// Mask the server header.
		builder.WebHost.UseKestrel(options =>
		{
			options.AddServerHeader = false;
		});

		// Add services to the container.
		builder.Services.AddControllers();

		// Add versioning configuration.
		builder.Services.AddApiVersioning(options =>
		{
			// Reporting api versions will return the headers
			// "api-supported-versions" and "api-deprecated-versions."
			options.ReportApiVersions = true;
			options.AssumeDefaultVersionWhenUnspecified = true;
			options.DefaultApiVersion = new ApiVersion(1, 0);
		}).AddMvc(options =>
		{
			// Automatically applies an api version based on the name of
			// the defining controller's namespace.
			options.Conventions.Add(new VersionByNamespaceConvention());
		});

		// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
		builder.Services.AddEndpointsApiExplorer();
		builder.Services.AddSwaggerGen();

		// Map the appsettings.json file to the AppSettings class.
		builder.Services.Configure<AppSettings>(builder.Configuration);

		var app = builder.Build();

		// Configure the HTTP request pipeline.
		if (app.Environment.IsDevelopment())
		{
			app.UseSwagger();
			app.UseSwaggerUI();
		}

		app.UseHttpsRedirection();

		app.UseAuthorization();

		app.MapControllers();

		app.Run();
	}
}