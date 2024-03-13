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
	public string Description { get; set; }

	[FirestoreProperty]
	public string Note { get; set; }

	[FirestoreProperty]
	public string Title { get; set; }

	[FirestoreProperty]
	public string URL { get; set; }
}