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

	public BookmarkTreeNode: BookmarkTreeNode;

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

	public SignOut(): void
	{
		this._authService.SignOut();
	}
}
