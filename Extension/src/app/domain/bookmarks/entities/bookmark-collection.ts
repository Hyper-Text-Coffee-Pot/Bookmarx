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
	 * Root collections cannot be dragged and moved.
	 */
	public ParentId: string;

	/**
	 * Represents the depth of the collection in the folder tree.
	 * Helps simplify the UI by indenting the collections.
	 */
	public Depth: number = 0;

	/**
	 * The index of the bookmark collection.
	 * Used to order the collections.
	 * Upon flattening the tree, this value is just 0, then it gets reassigned.
	 */
	public Index: number = 0;

	public Title: string = "N/A";

	public Bookmarks: Bookmark[] = [];

	/**
	 * This determines if its child collections are collapsed.
	 * Different from IsCollapsed which tells us about itself.
	 * This one is used to show the correct arrow icon.
	 * It also helps ensure that each child collection state is in sync.
	 */
	public ChildCollectionsCollapsed: boolean = false;

	/**
	 * Just some UI magic to toggle the visibility of the collection.
	 * This is used to determine if the collection should be shown or not
	 * when it is a nested collection.
	 */
	public IsCollapsed: boolean = false;

	/**
	 * A flattened way of knowing if the collection has child collections.
	 * This is used to determine if the collection should have a toggle button.
	 */
	public HasChildren: boolean = false;

	/**
	 * Defaults to the unicode character for a file folder.
	 */
	public Icon: string = "&#x1F4C1;";
}