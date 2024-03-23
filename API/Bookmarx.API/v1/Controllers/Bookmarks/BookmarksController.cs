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

	[HttpGet]
	[Route("get-all")]
	public async Task<IActionResult> GetAll()
	{
		var bookmarkCollections = new List<BookmarkCollection>();

		try
		{
			bookmarkCollections = await this._bookmarkService.GetBookmarks();
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}

		return Ok(bookmarkCollections);
	}

	[HttpPost]
	[Route("sync-bookmarks")]
	[Consumes("application/json")]
	public async Task<IActionResult> SyncBookmarks([FromBody] List<BookmarkCollection> bookmarkCollection)
	{
		try
		{
			await this._bookmarkService.ImportBookmarks(bookmarkCollection);
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}

		return Ok(bookmarkCollection);
	}
}