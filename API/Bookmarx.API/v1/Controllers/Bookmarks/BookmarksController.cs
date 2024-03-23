using Bookmarx.Shared.v1.Bookmarks.Entities;

namespace Bookmarx.API.v1.Controllers.Bookmarks;

[ApiController]
[Route("v{version:apiVersion}/bookmarks")]
[Authorize(Policy = ApiAuthPolicy.ActiveSessionAuthorization)]
public class BookmarksController : ControllerBase
{
	private readonly IBookmarkService _bookmarkService;

	public BookmarksController(IBookmarkService bookmarkService)
	{
		this._bookmarkService = bookmarkService ?? throw new ArgumentNullException(nameof(bookmarkService));
	}

	[HttpPost]
	[Route("sync-bookmarks")]
	[Consumes("application/json")]
	public async Task<IActionResult> SyncBookmarks([FromBody] List<BookmarkCollection> bookmarkCollection)
	{
		await this._bookmarkService.ImportBookmarks(bookmarkCollection);

		return Ok(bookmarkCollection);
	}
}