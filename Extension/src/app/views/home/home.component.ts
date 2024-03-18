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
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BasePageDirective
{
	/**
	 * Not a huge fan of maintaining state here, but it's the best we got.
	 */
	private singleClickTimer: any;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _bookmarksService: BookmarksService,
		private _blockUI: BlockUIService,
		private _cdr: ChangeDetectorRef,
		private _sanitizer: DomSanitizer,
		private _snackBar: MatSnackBar)
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
		this.singleClickTimer = setTimeout(() =>
		{
			if (this.IsDragging)
			{
				this.IsDragging = false;
				return;
			}

			this.Bookmarks = [...collection.Bookmarks];
			this._cdr.detectChanges();
		}, 250); // delay of 250ms
	}

	public HandleDoubleClick(collection: BookmarkCollection): void
	{
		clearTimeout(this.singleClickTimer);
		this.ToggleTree(collection, !collection.ChildCollectionsCollapsed);
	}

	/**
	 * This is a costly method, but there's not really a way around it.
	 * It's not a huge deal because it's only called when the user is dragging something.
	 * @param viewModelCollection
	 */
	public drop(viewModelCollection: CdkDragDrop<BookmarkCollection[]>)
	{
		let collectionSuccessfullyMoved = true;

		this.BodyElement.classList.remove('inheritCursors');
		this.BodyElement.style.cursor = 'unset';

		// Move the item in the array right away so all subsequent logic is being performed on the new state.
		moveItemInArray(this.BookmarkCollections, viewModelCollection.previousIndex, viewModelCollection.currentIndex);

		// let activeCollection = viewModelCollection.item.data;
		let draggedCollection = viewModelCollection.item.data;
		let laggingCollection = this.BookmarkCollections[viewModelCollection.currentIndex - 1];
		let movedCollection = this.BookmarkCollections[viewModelCollection.currentIndex];
		let leadingCollection = this.BookmarkCollections[viewModelCollection.currentIndex + 1];

		// The way in which the user is dragging the item and how Angular Material
		// handles moving the target element changes depending on drag direction.
		// In order to correctly handle move locations we need to factor this in.
		if (viewModelCollection.currentIndex > viewModelCollection.previousIndex)
		{
			// When you drag DOWN the target slides up so we need to use the leading collection.
			console.log("Moved down");
			let isChild = this.IsChildCollection(leadingCollection, movedCollection);
			if (isChild)
			{
				// Move the item back to where it was originally.
				moveItemInArray(this.BookmarkCollections, viewModelCollection.currentIndex, viewModelCollection.previousIndex);

				this._snackBar.open("Cannot move a collection into itself or its child collection.", "Ok", {
					politeness: 'assertive',
					duration: 5000
				});

				collectionSuccessfullyMoved = false;

				// Kick out as we don't need to perform any logic.
				return;
			}
			else
			{
				if (laggingCollection.HasChildren)
				{
					// This one is working great, do not touch.
					console.log("Pulled into a nested folder and increased depth");
					// The element was dragged outside of the original collection so reparent to the next collection.
					movedCollection.Depth = laggingCollection.Depth + 1;
					movedCollection.ParentId = laggingCollection.Id;
				}
				else if (draggedCollection.ParentId == movedCollection.ParentId
					&& movedCollection.ParentId == leadingCollection.ParentId)
				{
					console.log("Moved in the same collection at the same leve as next folder");
					// The element was dragged within the same collection, so just move it within that collection.
					movedCollection.Depth = leadingCollection.Depth;
					movedCollection.ParentId = leadingCollection.ParentId;
				}
			}
		}
		else if (viewModelCollection.currentIndex == viewModelCollection.previousIndex)
		{
			// Nothing happened so we don't do anything.
			console.log("No changes");
			return;
		}
		else
		{
			// When you drag UP the target slides down so we need to use the lagging collection.
			console.log("Moved up");
			console.log(laggingCollection);
			movedCollection.Depth = laggingCollection.HasChildren ? laggingCollection.Depth + 1 : leadingCollection.Depth;
			movedCollection.ParentId = laggingCollection.HasChildren ? laggingCollection.Id : leadingCollection.ParentId;
		}

		// NOTE: DO NOT CHANGE THIS LOGIC THIS WORKS GREAT
		this.ReparentChildItemsOfMovedCollection(movedCollection);
	}

	private ReparentChildItemsOfMovedCollection(movedCollection: BookmarkCollection): void
	{
		// NOTE: DO NOT CHANGE THIS LOGIC THIS WORKS GREAT
		// If there are any child elements on the moved collection then go move those back under the collection.
		if (movedCollection.HasChildren)
		{
			// Now, reorder everything correctly.
			let reorderedCollections: BookmarkCollection[] = [];
			let childCollections: BookmarkCollection[] = this.FindChildCollections(movedCollection.Id);

			// Remove child collections from BookmarkCollections array
			reorderedCollections = this.BookmarkCollections.filter(collection => !childCollections.includes(collection));

			// Reinsert child collections after the moved viewModelCollection
			for (let i = 0; i < reorderedCollections.length; i++)
			{
				if (reorderedCollections[i].Id === movedCollection.Id)
				{
					// Update the depth to match the new location.
					childCollections.forEach((collection) =>
					{
						collection.Depth = movedCollection.Depth + 1;
					});

					// Insert the child collections into the array right after the parent collection.
					reorderedCollections = reorderedCollections.slice(0, i + 1).concat(childCollections).concat(reorderedCollections.slice(i + 1));
					break;
				}
			}

			// Rewrite our indexes to match the new order.
			reorderedCollections.forEach((collection, index) =>
			{
				collection.Index = index;
			});

			this.BookmarkCollections = [...reorderedCollections];
			this._cdr.detectChanges();
		}

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
		//this.ToggleTree(collection, true);
		this.BodyElement.classList.add('inheritCursors');
		this.BodyElement.style.cursor = 'grabbing';
	}

	/**
	 * Sets collapsed properties to true, always.
	 * @param collection 
	 */
	public ToggleTree(collection: BookmarkCollection, isCollapsed: boolean): void
	{
		collection.ChildCollectionsCollapsed = isCollapsed;

		// Go and find all the children of this collection and collapse them.
		// We also need to go and find all the children of the children and collapse them.
		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId == collection.Id)
			{
				this.BookmarkCollections[i].IsCollapsed = isCollapsed;

				// recursively call the function for child collections
				this.ToggleTree(this.BookmarkCollections[i], isCollapsed);
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
		if (targetCollection.ParentId === activeCollection.Id)
		{
			return true;
		}

		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId === activeCollection.Id)
			{
				if (this.IsChildCollection(targetCollection, this.BookmarkCollections[i]))
				{
					return true;
				}
			}
		}

		return false;
	}
}
