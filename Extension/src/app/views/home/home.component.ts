import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarksService } from 'src/app/domain/bookmarks/services/bookmarks.service';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { IBookmarkTreeNode } from 'src/app/domain/web-api/chrome/models/ibookmark-tree-node';

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

	public BookmarkTreeNodes: BookmarkTreeNode[] = null;

	public override ngOnInit(): void
	{
		// Add your code here
	}

	public GetAllBookmarks(): void
	{
		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			// Get the root tree node for now.
			// This first one is always a folder which will contain child elements.
			let bookmarksToImport: IBookmarkTreeNode = bookmarks[0].children[0];

			this.TraverseBookmarks([bookmarksToImport]);

			// this._bookmarksService.SyncBookmarks(this.BookmarkTreeNodes)
			// 	.subscribe({
			// 		next: (result: BookmarkTreeNode) =>
			// 		{
			// 			console.log(result);
			// 		}
			// 	});
		});
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}

	private TraverseBookmarks(bookmarkTreeNodes: IBookmarkTreeNode[]): void
	{
		for (let i = 0; i < bookmarkTreeNodes.length; i++)
		{
			if (bookmarkTreeNodes[i].url == null
				|| bookmarkTreeNodes[i].url == undefined
				|| bookmarkTreeNodes[i].url == "")
			{
				// It's a folder.
				let folder = new BookmarkTreeNode(
					bookmarkTreeNodes[i].dateAdded,
					bookmarkTreeNodes[i].id,
					bookmarkTreeNodes[i].index,
					bookmarkTreeNodes[i].parentId,
					bookmarkTreeNodes[i].title,
					null,
					bookmarkTreeNodes[i].children);
				console.log(folder);
				continue;
			}
		}
	}

	// for (let i = 0; i < existingBookmarkTreeNodes.length; i++)
	// {
	// 	if (existingBookmarkTreeNodes[i].children == null)
	// 	{
	// 		// It's a straight up bookmark
	// 		let bookmark = new Bookmark(existingBookmarkTreeNodes[i].title, existingBookmarkTreeNodes[i].url);
	// 		syncedBookmarks.Bookmarks.push(bookmark);
	// 		continue;
	// 	}
	// 	else
	// 	{
	// 		// It's a folder, need to go deeper
	// 		let bookmarkCollection = new BookmarkCollection(i, existingBookmarkTreeNodes[i].title);
	// 		syncedBookmarks.AddBookmarkCollection(bookmarkCollection);
	// 		this.TraverseBookmarks(existingBookmarkTreeNodes[i].children as IBookmarks, bookmarkCollection);
	// 	}
	// }
}
