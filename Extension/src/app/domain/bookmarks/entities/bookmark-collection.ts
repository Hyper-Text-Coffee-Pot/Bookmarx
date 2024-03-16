import { Bookmark } from "./bookmark";

export class BookmarkCollection
{
	/**
	 * A UUID that's generated for each bookmark collection.
	 */
	public Id: string;

	/**
	 * The parent collection Id of the bookmark collection.
	 * If this is null, then it's a root collection.
	 */
	public ParentId: string;

	/**
	 * Represents the depth of the collection in the folder tree.
	 * Helps simplify the UI by indenting the collections.
	 */
	public Depth: number;

	/**
	 * The index of the bookmark collection.
	 * Used to order the collections.
	 * Upon flattening the tree, this value is just 0, then it gets reassigned.
	 */
	public Index: number = 0;

	public Title: string = "N/A";

	public Bookmarks: Bookmark[] = [];
}