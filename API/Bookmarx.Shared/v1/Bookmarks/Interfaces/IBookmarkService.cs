namespace Bookmarx.Shared.v1.Bookmarks.Interfaces;

public interface IBookmarkService
{
	Task<List<BookmarkCollection>> GetBookmarks();

	Task ImportBookmarks(List<BookmarkCollection> bookmarkCollections);
}