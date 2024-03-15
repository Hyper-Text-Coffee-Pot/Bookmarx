import { IBookmarkTreeNode } from "../../web-api/chrome/models/ibookmark-tree-node";

export class BookmarkTreeNode implements IBookmarkTreeNode
{
	constructor(
		dateAdded: number,
		id: string,
		index: number,
		parentId: string,
		title: string,
		url?: string,
		children?: IBookmarkTreeNode[])
	{
		this.dateAdded = dateAdded;
		this.id = id;
		this.index = index;
		this.parentId = parentId;
		this.title = title;
		this.url = url;
		this.children = children;
	}

	/**
	 * Defaults to the unicode character for a file folder.
	 */
	public Icon: string = "&#x1F4C1;";

	public dateAdded: number;

	public id: string;

	public index: number;

	public parentId: string;

	public title: string;

	/**
	 * Optional.
	 * If this node is a folder, this property is omitted.
	 */
	public url?: string;

	/**
	 * Optional.
	 * This field is omitted if the node is not a folder.
	 */
	public children?: IBookmarkTreeNode[];

	public dateGroupModified?: number;

	public AddBookmarkTreeNode(bookmarkTreeNode: BookmarkTreeNode): void
	{
		this.children.push(bookmarkTreeNode);
	}
}