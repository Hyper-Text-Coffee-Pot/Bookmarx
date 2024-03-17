import { ChangeDetectorRef, Component, SecurityContext } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarksService } from 'src/app/domain/bookmarks/services/bookmarks.service';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { IBookmarkTreeNode } from 'src/app/domain/web-api/chrome/models/ibookmark-tree-node';
import { CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit, CdkDragStart, CdkDrag } from '@angular/cdk/drag-drop';
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
		private _cdr: ChangeDetectorRef,
		private _sanitizer: DomSanitizer)
	{
		super(_route, _titleService);
	}

	public BookmarkCollections: BookmarkCollection[] = [];

	public Bookmarks: Bookmark[] = [];

	public IsDragging: boolean;

	public BodyElement: HTMLElement = document.body;

	public override ngOnInit(): void
	{
	}

	public ClearBookmarks(): void
	{
		this.BookmarkCollections = [];
	}

	public OpenBookmarkCollection(collection: BookmarkCollection): void
	{
		console.log(collection);
		if (this.IsDragging)
		{
			this.IsDragging = false;
			return;
		}

		this.Bookmarks = [...collection.Bookmarks];
		this._cdr.detectChanges();
	}

	public HandleDoubleClick(collection: BookmarkCollection): void
	{
		this.CollapseTree(collection);
	}

	public drop(viewModelCollection: CdkDragDrop<BookmarkCollection[]>)
	{
		console.log(this.BookmarkCollections);
		let activeCollection = viewModelCollection.item.data;

		this.BodyElement.classList.remove('inheritCursors');
		this.BodyElement.style.cursor = 'unset';

		let targetCollection = this.BookmarkCollections[viewModelCollection.currentIndex];
		let nextCollection = this.BookmarkCollections[viewModelCollection.currentIndex + 1];

		// Verify that the move doesn't attempt to move a collection into itself or a child collection.
		console.log(activeCollection);
		console.log(targetCollection);
		console.log(nextCollection);

		// Check if the target collection is a child of the active collection
		let isChild = this.IsChildCollection(targetCollection, activeCollection);
		if (isChild)
		{
			alert("Cannot move a collection into itself or its child collection.");
		}
		else if (targetCollection.ParentId === activeCollection.Id)
		{
			// If we're moving the collection to the same parent, then we can just move it.
			activeCollection.ParentId = targetCollection.ParentId;
			activeCollection.Depth = targetCollection.Depth;
			activeCollection.Index = activeCollection.currentIndex;
			moveItemInArray(this.BookmarkCollections, viewModelCollection.previousIndex, viewModelCollection.currentIndex);
		}
		else
		{
			moveItemInArray(this.BookmarkCollections, viewModelCollection.previousIndex, viewModelCollection.currentIndex);
		}

		// Now, reorder everything correctly.
		let reorderedCollections: BookmarkCollection[] = [];

		let childCollections: BookmarkCollection[] = this.FindChildCollections(activeCollection.Id);

		// Remove child collections from BookmarkCollections array
		this.BookmarkCollections = this.BookmarkCollections.filter(collection => !childCollections.includes(collection));

		// Reinsert child collections after the moved viewModelCollection
		for (let i = 0; i < childCollections.length; i++)
		{
			let index = this.BookmarkCollections.findIndex(collection => collection.Id === childCollections[i].Id);
			if (index !== -1)
			{
				this.BookmarkCollections.splice(index + 1, 0, childCollections[i]);
			}
		}

		// for (let i = 0; i < this.BookmarkCollections.length; i++)
		// {
		// 	this.BookmarkCollections[i].Index = i;
		// }

		console.log(this.BookmarkCollections);
	}

	private FindChildCollections(parentId: string): BookmarkCollection[]
	{
		let childCollections: BookmarkCollection[] = [];

		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId === parentId)
			{
				childCollections.push(this.BookmarkCollections[i]);
				let grandchildren = this.FindChildCollections(this.BookmarkCollections[i].Id);
				childCollections = childCollections.concat(grandchildren);
			}
		}

		return childCollections;
	}

	public HandleDragStart(event: CdkDragStart, collection: BookmarkCollection): void
	{
		this.IsDragging = true;

		// TODO: Put this back.
		//this.CollapseTree(collection);
		this.BodyElement.classList.add('inheritCursors');
		this.BodyElement.style.cursor = 'grabbing';
	}

	public CollapseTree(collection: BookmarkCollection): void
	{
		collection.ChildCollectionsCollapsed = !collection.ChildCollectionsCollapsed;

		// Go and find all the children of this collection and collapse them.
		// We also need to go and find all the children of the children and collapse them.
		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId == collection.Id)
			{
				this.BookmarkCollections[i].IsCollapsed = collection.ChildCollectionsCollapsed;

				// recursively call the function for child collections
				this.CollapseTree(this.BookmarkCollections[i]);
			}
		}
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}

	/**
	 * Sanitize a URL to prevent XSS attacks.
	 * @param userGeneratedUrl 
	 * @returns 
	 */
	public SanitizeUrl(userGeneratedUrl: string): string
	{
		return this._sanitizer.sanitize(SecurityContext.URL, userGeneratedUrl);
	}

	public ImportExistingBookmarks(): void
	{
		this.BookmarkCollections = [];

		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			// Get the root tree node for now.
			// This first one is always a folder which will contain child elements.
			let bookmarksToImport: IBookmarkTreeNode[] = bookmarks[0].children;

			if (bookmarksToImport.length > 0)
			{
				let collections: BookmarkCollection[] = [];

				// New root node for the current devices set of bookmarks.
				let deviceBookmarkCollection = new BookmarkCollection();
				deviceBookmarkCollection.Id = uuid.v4();
				deviceBookmarkCollection.ParentId = null;
				deviceBookmarkCollection.Title = "Device Bookmarks";
				deviceBookmarkCollection.HasChildren = true;
				collections.push(deviceBookmarkCollection);

				// This initial import goes and gets all the browsers existing bookmarks.
				// This typically will include Favorites, Other and Mobile, so we need
				// to loop over these initial root nodes first to get to the actual bookmarks.
				for (let i = 0; i < bookmarksToImport.length; i++)
				{
					// These root collections will never have a parent, so we set it to null.
					let bookmarkCollection = new BookmarkCollection();
					// Walking backwards for the index on these root folders to keep them up top.
					bookmarkCollection.Id = uuid.v4();
					bookmarkCollection.ParentId = deviceBookmarkCollection.Id;
					bookmarkCollection.Depth = deviceBookmarkCollection.Depth + 1;
					bookmarkCollection.Title = bookmarksToImport[i].title;
					collections = collections.concat(this.FlattenBookmarkTreeNodesIntoCollections(bookmarksToImport[i], bookmarkCollection));
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
			}
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

					bookmarkCollection.HasChildren = true;

					// If there are any more children items on this then iterate those.
					let childBookmarkCollection = new BookmarkCollection();
					childBookmarkCollection.Id = uuid.v4();
					childBookmarkCollection.ParentId = bookmarkCollection.Id;
					childBookmarkCollection.Title = child.title;
					childBookmarkCollection.Depth = bookmarkCollection.Depth + 1;
					bookmarkCollections = bookmarkCollections.concat(this.FlattenBookmarkTreeNodesIntoCollections(child, childBookmarkCollection));
				}
			});
		}

		return bookmarkCollections;
	}

	/**
	 * Iterate over the collections to see if the target collection is a child of the active collection.
	 * @param targetCollection 
	 * @param activeCollection 
	 * @returns 
	 */
	private IsChildCollection(targetCollection: BookmarkCollection, activeCollection: BookmarkCollection): boolean
	{
		if (targetCollection.ParentId == activeCollection.Id)
		{
			return true;
		}

		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId == targetCollection.Id)
			{
				if (this.IsChildCollection(this.BookmarkCollections[i], activeCollection))
				{
					return true;
				}
			}
		}

		return false;
	}
}
