﻿global using Asp.Versioning;
global using Asp.Versioning.Conventions;
global using AutoMapper;
global using Bookmarx.API.v1.Controllers.Membership.Models;
global using Bookmarx.API.v1.Extensions;
global using Bookmarx.API.v1.Filters;
global using Bookmarx.Shared.v1.Configuration.Models;
global using Bookmarx.Shared.v1.Identity.Handlers;
global using Bookmarx.Shared.v1.Identity.Interfaces;
global using Bookmarx.Shared.v1.Identity.Models;
global using Bookmarx.Shared.v1.Identity.Policies;
global using Bookmarx.Shared.v1.Identity.Requirements;
global using Bookmarx.Shared.v1.Identity.Services;
global using Bookmarx.Shared.v1.Membership.Interfaces;
global using Bookmarx.Shared.v1.Membership.Models;
global using Bookmarx.Shared.v1.Membership.Services;
global using Bookmarx.Shared.v1.Sales.Interfaces;
global using Bookmarx.Shared.v1.Sales.Services;
global using Bookmarx.Shared.v1.ThirdParty.Google.Interfaces;
global using Bookmarx.Shared.v1.ThirdParty.Google.Services;
global using FirebaseAdmin;
global using Google.Apis.Auth.OAuth2;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.Net.Http.Headers;
global using Serilog;
global using Serilog.Events;
global using Stripe;