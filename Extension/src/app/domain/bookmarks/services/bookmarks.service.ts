import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BookmarkTreeNode } from '../entities/bookmark-tree-node';
import { BookmarkCollection } from '../entities/bookmark-collection';

@Injectable({
	providedIn: 'root'
})
export class BookmarksService
{
	constructor(private _httpClient: HttpClient) { }

	public SyncBookmarks(bookmarkCollections: BookmarkCollection[]): Observable<any>
	{
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._httpClient
			.post(
				`${ environment.apiUrlV1 }/bookmarks/sync-bookmarks`,
				bookmarkCollections,
				{ headers })
			.pipe(
				retry(3)
			);
	}
}
