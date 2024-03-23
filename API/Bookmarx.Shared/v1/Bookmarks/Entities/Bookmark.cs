using Google.Cloud.Firestore;

namespace Bookmarx.Shared.v1.Bookmarks.Entities;

[FirestoreData]
public class Bookmark
{
	public Bookmark()
	{
		// Needed for firebase
	}

	[FirestoreProperty]
	public DateTime DateTimeAddedUTC { get; set; }

	[FirestoreProperty]
	public string Description { get; set; } = string.Empty;

	[FirestoreProperty]
	public string Id { get; set; }

	[FirestoreProperty]
	public int Index { get; set; }

	[FirestoreProperty]
	public string Note { get; set; } = string.Empty;

	[FirestoreProperty]
	public string ParentId { get; set; }

	[FirestoreProperty]
	public string Title { get; set; }

	[FirestoreProperty]
	public string Url { get; set; }
}