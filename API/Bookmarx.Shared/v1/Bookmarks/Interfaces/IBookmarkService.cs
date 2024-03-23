using Bookmarx.Shared.v1.Bookmarks.Entities;

namespace Bookmarx.Shared.v1.Bookmarks.Interfaces;

public interface IBookmarkService
{
	Task ImportBookmarks(List<BookmarkCollection> bookmarkCollections);
}