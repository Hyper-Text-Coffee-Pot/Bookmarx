import { ChangeDetectorRef, Component } from '@angular/core';
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
import { BlockUIService } from 'ng-block-ui';

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
		private _bookmarksService: BookmarksService,
		private _blockUI: BlockUIService,
		private _cdr: ChangeDetectorRef)
	{
		super(_route, _titleService);
	}

	public BookmarkCollections: BookmarkCollection[] = [];

	public override ngOnInit(): void
	{
	}

	public ClearBookmarks(): void
	{
		this.BookmarkCollections = [];
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
				let depth = 0;
				// These root collections will never have a parent, so we set it to null.
				let bookmarkCollection = new BookmarkCollection();
				// Walking backwards for the index on these root folders to keep them up top.
				bookmarkCollection.Id = uuid.v4();
				bookmarkCollection.ParentId = null;
				bookmarkCollection.Depth = depth;
				bookmarkCollection.Title = bookmarksToImport[i].title;
				collections = collections.concat(this.FlattenBookmarkTreeNodesIntoCollections(bookmarksToImport[i], bookmarkCollection, depth));
			}

			// Sort the collections by index to pull root folders to the top, then start setting the indexes on collections.
			collections = collections.sort((a, b) => a.Index - b.Index);
			for (let i = 0; i < collections.length; i++)
			{
				collections[i].Index = i;
			}

			this.BookmarkCollections = [...collections];
			this._cdr.detectChanges();

			// // We need to slowly add things to the DOM tree or we'll overwhelm the browser.
			// let batchSize = 10; // Adjust this value based on your performance needs
			// let batchCount = Math.ceil(collections.length / batchSize);

			// for (let i = 0; i < batchCount; i++)
			// {
			// 	setTimeout(() =>
			// 	{
			// 		let batch = collections.slice(i * batchSize, (i + 1) * batchSize);
			// 		this.BookmarkCollections = this.BookmarkCollections.concat(batch);
			// 	}, i * 500); // Adjust delay as needed
			// }


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
		bookmarkCollection: BookmarkCollection,
		depth: number): BookmarkCollection[]
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
					childBookmarkCollection.Depth = depth;
					childBookmarkCollection.Title = child.title;
					bookmarkCollections = bookmarkCollections.concat(this.FlattenBookmarkTreeNodesIntoCollections(child, childBookmarkCollection, depth + 1));
				}
			});
		}

		return bookmarkCollections;
	}

	drop(event: CdkDragDrop<BookmarkCollection[]>)
	{
		console.log(event);
		moveItemInArray(this.BookmarkCollections, event.previousIndex, event.currentIndex);
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}
}
