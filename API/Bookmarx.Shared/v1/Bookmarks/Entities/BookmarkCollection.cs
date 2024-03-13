using Bookmarx.Data.v1.Interfaces;
using Google.Cloud.Firestore;

namespace Bookmarx.Shared.v1.Bookmarks.Entities;

[FirestoreData]
public class BookmarkCollection : IFirebaseEntity
{
	public BookmarkCollection()
	{
		// Needed for firebase
	}

	[FirestoreProperty]
	public List<BookmarkCollection> BookmarkCollections { get; set; } = new List<BookmarkCollection>();

	[FirestoreProperty]
	public List<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();

	/// <summary>
	/// Defaults to the html character code for a file folder.
	/// </summary>
	[FirestoreProperty]
	public string Icon { get; set; } = "&#x1F4C1;";

	[FirestoreProperty]
	public string Id { get; set; }

	[FirestoreProperty]
	public string Name { get; set; }

	/// <summary>
	/// The order, or priority, of the item in the collection.
	/// This value should be between 0 and 1 to keep it light.
	/// </summary>
	[FirestoreProperty]
	public decimal Priority { get; set; }
}