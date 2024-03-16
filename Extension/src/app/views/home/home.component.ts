import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarksService } from 'src/app/domain/bookmarks/services/bookmarks.service';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { IBookmarkTreeNode } from 'src/app/domain/web-api/chrome/models/ibookmark-tree-node';
import { CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';
import * as uuid from 'uuid';
import { Bookmark } from 'src/app/domain/bookmarks/entities/bookmark';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BasePageDirective
{
	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _bookmarksService: BookmarksService)
	{
		super(_route, _titleService);
	}

	public BookmarkTreeNode: BookmarkTreeNode = null;

	public BookmarkCollections: BookmarkCollection[] = [];

	public get ConnectedDropListsIds(): string[]
	{
		// We reverse ids here to respect items nesting hierarchy
		let ids = this.getIdsRecursive(this.BookmarkTreeNode).reverse();

		console.log(ids);

		return ids;
	}

	public override ngOnInit(): void
	{
	}

	public GetAllBookmarks(): void
	{
		this.BookmarkCollections = [];

		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			// Get the root tree node for now.
			// This first one is always a folder which will contain child elements.
			let bookmarksToImport: IBookmarkTreeNode[] = bookmarks[0].children;
			let collections: BookmarkCollection[] = [];

			// This initial import goes and gets all the browsers existing bookmarks.
			// This typically will include Favorites, Other and Mobile, so we need
			// to loop over these initial root nodes first to get to the actual bookmarks.
			for (let i = 0; i < bookmarksToImport.length; i++)
			{
				// These root collections will never have a parent, so we set it to null.
				let bookmarkCollection = new BookmarkCollection();
				// Walking backwards for the index on these root folders to keep them up top.
				bookmarkCollection.Index = -i;
				bookmarkCollection.Id = uuid.v4();
				bookmarkCollection.ParentId = null;
				bookmarkCollection.Title = bookmarksToImport[i].title;
				collections = collections.concat(this.FlattenBookmarkTreeNodesIntoCollections(bookmarksToImport[i], bookmarkCollection));
			}

			// Sort the collections by index to pull root folders to the top, then start setting the indexes on collections.
			this.BookmarkCollections = collections.sort((a, b) => a.Index - b.Index);
			this.BookmarkCollections.forEach((collection, index) => collection.Index = index);

			console.log(this.BookmarkCollections);

			// this.BookmarkTreeNode = new BookmarkTreeNode(bookmarksToImport);

			// console.log(this.BookmarkTreeNode);

			// this._bookmarksService.SyncBookmarks(this.BookmarkTreeNodes)
			// 	.subscribe({
			// 		next: (result: BookmarkTreeNode) =>
			// 		{
			// 			console.log(result);
			// 		}
			// 	});
		});
	}

	private FlattenBookmarkTreeNodesIntoCollections(
		bookmarkTreeNode: IBookmarkTreeNode,
		bookmarkCollection: BookmarkCollection): BookmarkCollection[]
	{
		let bookmarkCollections: BookmarkCollection[] = [bookmarkCollection];

		if (bookmarkTreeNode.children)
		{
			bookmarkTreeNode.children.forEach((child) =>
			{
				if (child.url != null && child.url != undefined && child.url != "")
				{
					// If the URL has a value it's a bookmark so add it.
					let bookmark = new Bookmark();
					bookmark.Id = uuid.v4();
					bookmark.ParentId = bookmarkCollection.Id;
					bookmark.Title = child.title;
					bookmark.Url = child.url;
					bookmarkCollection.Bookmarks.push(bookmark);
					return;
				}
				else if (child.children)
				{
					// If there are any more children items on this then iterate those.
					let childBookmarkCollection = new BookmarkCollection();
					childBookmarkCollection.Id = uuid.v4();
					childBookmarkCollection.ParentId = bookmarkCollection.Id;
					childBookmarkCollection.Title = child.title;
					bookmarkCollections = bookmarkCollections.concat(this.FlattenBookmarkTreeNodesIntoCollections(child, childBookmarkCollection));
				}
			});
		}

		return bookmarkCollections;
	}

	public onDragDrop(event: CdkDragDrop<BookmarkTreeNode>)
	{
		event.container.element.nativeElement.classList.remove('active');
		console.log(event);

		if (this.canBeDropped(event))
		{
			console.log("I can be dropped");
			const movingItem: BookmarkTreeNode = event.item.data;
			event.container.data.Children.push(movingItem);
			event.previousContainer.data.Children = event.previousContainer.data.Children.filter((child) => child.Id !== movingItem.Id);
		} else
		{
			console.log("I was just moved in the array");
			moveItemInArray(
				event.container.data.Children,
				event.previousContainer.data.Index,
				event.container.data.Index
			);
			// moveItemInArray(
			// 	event.container.data.Children,
			// 	event.previousIndex,
			// 	event.currentIndex
			// );
		}

		// Check for changes
		console.log(this.BookmarkTreeNode);
	}

	private getIdsRecursive(item: BookmarkTreeNode): string[]
	{
		let ids = [item.Id];

		if (item.Children?.length > 0)
		{
			item.Children.forEach((childItem) => { ids = ids.concat(this.getIdsRecursive(childItem)) });
		}

		return ids;
	}

	private canBeDropped(event: CdkDragDrop<BookmarkTreeNode, BookmarkTreeNode>): boolean
	{
		const movingItem: BookmarkTreeNode = event.item.data;

		return event.previousContainer.id !== event.container.id
			&& this.isNotSelfDrop(event)
			&& !this.hasChild(movingItem, event.container.data);
	}

	private isNotSelfDrop(event: CdkDragDrop<BookmarkTreeNode> | CdkDragEnter<BookmarkTreeNode> | CdkDragExit<BookmarkTreeNode>): boolean
	{
		return event.container.data.Id !== event.item.data.uId;
	}

	private hasChild(parentItem: BookmarkTreeNode, childItem: BookmarkTreeNode): boolean
	{
		const hasChild = parentItem.Children?.some((item) => item.Id === childItem.Id);
		return hasChild ? true : parentItem.Children?.some((item) => this.hasChild(item, childItem));
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}
}
