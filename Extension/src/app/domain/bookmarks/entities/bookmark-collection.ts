import { Bookmark } from "./bookmark";

export class BookmarkCollection
{
	constructor(name: string)
	{
		this.Name = name;
	}

	public BookmarkCollections: BookmarkCollection[] = [];

	public Bookmarks: Bookmark[] = [];

	/**
	 * Defaults to the unicode character for a file folder.
	 */
	public Icon: string = "&#x1F4C1;";

	public Id: string;

	public Name: string;

	/**
	 * The order, or priority, of the item in the collection.
	 * This value should be between 0 and 1 to keep it light.
	 */
	public Priority: number;

	public AddBookmarkCollection(bookmarkCollection: BookmarkCollection): void
	{
		this.BookmarkCollections.push(bookmarkCollection);
	}
}