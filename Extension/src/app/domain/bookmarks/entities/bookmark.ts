export class Bookmark
{
	/**
	 * A UUID that's generated for each bookmark.
	 */
	public Id: string;

	/**
	 * The parent collection Id of the bookmark.
	 */
	public ParentId: string;

	/**
	 * The index of the bookmark, used for sorting.
	 */
	public Index: number;

	public Title: string;

	public Url: string;
}