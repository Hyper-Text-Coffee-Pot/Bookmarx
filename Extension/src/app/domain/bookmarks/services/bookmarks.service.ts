import { Injectable } from '@angular/core';
import { BookmarkCollection } from '../entities/bookmark-collection';
import { Observable, retry } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class BookmarksService
{
	constructor(private _httpClient: HttpClient) { }

	public SyncBookmarks(bookmarkCollection: BookmarkCollection): Observable<any>
	{
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._httpClient
			.post(
				`${ environment.apiUrlV1 }/bookmarks/sync-bookmarks`,
				bookmarkCollection,
				{ headers })
			.pipe(
				retry(3)
			);
	}
}
