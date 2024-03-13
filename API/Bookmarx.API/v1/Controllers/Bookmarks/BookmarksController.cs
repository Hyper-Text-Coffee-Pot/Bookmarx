using Bookmarx.Shared.v1.Bookmarks.Entities;

namespace Bookmarx.API.v1.Controllers.Bookmarks;

[ApiController]
[Route("v{version:apiVersion}/bookmarks")]
public class BookmarksController : ControllerBase
{
	[HttpPost]
	[Route("sync-bookmarks")]
	[Consumes("application/json")]
	public IActionResult SyncBookmarks([FromBody] BookmarkCollection bookmarkCollection)
	{
		return Ok(bookmarkCollection);
	}
}