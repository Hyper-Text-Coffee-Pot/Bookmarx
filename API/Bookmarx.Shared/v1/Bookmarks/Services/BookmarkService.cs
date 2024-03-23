namespace Bookmarx.Shared.v1.Bookmarks.Services;

public class BookmarkService : IBookmarkService
{
	private readonly ICurrentMemberService _currentMemberService;

	private readonly FirestoreProvider _firestoreProvider;

	private readonly ILogger<BookmarkService> _logger;

	public BookmarkService(
		ILogger<BookmarkService> _logger,
		FirestoreProvider _firestoreProvider,
		ICurrentMemberService currentMemberService)
	{
		this._logger = _logger ?? throw new ArgumentNullException(nameof(_logger));
		this._firestoreProvider = _firestoreProvider ?? throw new ArgumentNullException(nameof(_firestoreProvider));
		this._currentMemberService = currentMemberService ?? throw new ArgumentNullException(nameof(currentMemberService));
	}

	public async Task<List<BookmarkCollection>> GetBookmarks()
	{
		var collections = new List<BookmarkCollection>();

		var currentMemberAccount = await this._currentMemberService.GetFreshMember();

		if (currentMemberAccount != null)
		{
			collections = currentMemberAccount.BookmarkCollections;
		}

		return collections;
	}

	public async Task ImportBookmarks(List<BookmarkCollection> bookmarkCollections)
	{
		var currentMemberAccount = await this._currentMemberService.GetFreshMember();

		if (currentMemberAccount != null)
		{
			// Quick modification to imported date times for all items.
			foreach (var bookmarkCollection in bookmarkCollections)
			{
				bookmarkCollection.DateTimeAddedUTC = DateTime.UtcNow;

				foreach (var bookmark in bookmarkCollection.Bookmarks)
				{
					bookmark.DateTimeAddedUTC = DateTime.UtcNow;
				}
			}

			currentMemberAccount.BookmarkCollections = bookmarkCollections;

			await this._firestoreProvider.AddOrUpdateById(currentMemberAccount, CancellationToken.None);
		}
	}
}