import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';
import { Bookmark } from 'src/app/domain/bookmarks/entities/bookmark';
import { IBookmarks } from 'src/app/domain/web-api/chrome/models/bookmarks';

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
		private _authService: AuthService)
	{
		super(_route, _titleService);
	}

	public override ngOnInit(): void
	{
		// Add your code here
	}

	public GetAllBookmarks(): void
	{
		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			let primaryBookmarkFolders = bookmarks[0].children[0].children;

			let bookmarkCollection = new BookmarkCollection(0, "Synced Bookmarks");

			this.TraverseBookmarks(primaryBookmarkFolders, bookmarkCollection);

			console.log(bookmarkCollection);
		});
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}

	private TraverseBookmarks(primaryBookmarkFolders: IBookmarks, syncedBookmarks: BookmarkCollection): void
	{
		for (let i = 0; i < primaryBookmarkFolders.length; i++)
		{
			if (primaryBookmarkFolders[i].children == null)
			{
				// It's a straight up bookmark
				let bookmark = new Bookmark(primaryBookmarkFolders[i].title, primaryBookmarkFolders[i].url);
				syncedBookmarks.Bookmarks.push(bookmark);
				continue;
			}
			else
			{
				// It's a folder, need to go deeper
				let bookmarkCollection = new BookmarkCollection(i, primaryBookmarkFolders[i].title);
				syncedBookmarks.AddBookmarkCollection(bookmarkCollection);
				this.TraverseBookmarks(primaryBookmarkFolders[i].children as IBookmarks, bookmarkCollection);
			}
		}
	}
}
