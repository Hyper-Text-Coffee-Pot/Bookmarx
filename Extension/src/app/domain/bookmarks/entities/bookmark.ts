export class Bookmark
{
	public DateTimeAddedUTC: string;

	public Description: string;

	/**
	 * A UUID that's generated for each bookmark.
	 */
	public Id: string;

	/**
	 * The index of the bookmark, used for sorting.
	 */
	public Index: number;

	public Note: string;

	/**
	 * The parent collection Id of the bookmark.
	 */
	public ParentId: string;

	public Title: string;

	public Url: string;
}