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
	public List<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();

	[FirestoreProperty]
	public bool ChildCollectionsCollapsed { get; set; }

	[FirestoreProperty]
	public DateTime DateTimeAddedUTC { get; set; }

	[FirestoreProperty]
	public int Depth { get; set; }

	[FirestoreProperty]
	public bool HasChildren { get; set; }

	/// <summary>
	/// Defaults to the html character code for a file folder.
	/// </summary>
	[FirestoreProperty]
	public string Icon { get; set; } = "&#x1F4C1;";

	[FirestoreProperty]
	public string Id { get; set; }

	[FirestoreProperty]
	public int Index { get; set; }

	[FirestoreProperty]
	public bool IsCollapsed { get; set; }

	[FirestoreProperty]
	public bool IsLastChild { get; set; }

	/// <summary>
	/// The parent collection Id of the bookmark collection.
	/// If this is null, then it's a root collection.
	/// </summary>
	[FirestoreProperty]
	public string? ParentId { get; set; }

	[FirestoreProperty]
	public string Title { get; set; }
}