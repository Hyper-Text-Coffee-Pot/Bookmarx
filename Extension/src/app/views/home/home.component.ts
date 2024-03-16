import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarksService } from 'src/app/domain/bookmarks/services/bookmarks.service';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { IBookmarkTreeNode } from 'src/app/domain/web-api/chrome/models/ibookmark-tree-node';
import { CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';

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

	public get ConnectedDropListsIds(): string[]
	{
		// We reverse ids here to respect items nesting hierarchy
		return this.getIdsRecursive(this.BookmarkTreeNode).reverse();
	}

	public override ngOnInit(): void
	{
	}

	public GetAllBookmarks(): void
	{
		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			// Get the root tree node for now.
			// This first one is always a folder which will contain child elements.
			let bookmarksToImport: IBookmarkTreeNode = bookmarks[0].children[0];

			this.BookmarkTreeNode = new BookmarkTreeNode(bookmarksToImport);

			console.log(this.BookmarkTreeNode);

			// this._bookmarksService.SyncBookmarks(this.BookmarkTreeNodes)
			// 	.subscribe({
			// 		next: (result: BookmarkTreeNode) =>
			// 		{
			// 			console.log(result);
			// 		}
			// 	});
		});
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
