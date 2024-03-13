import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

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
		chrome.bookmarks.getTree((bookmarks) => {
			console.log(bookmarks);
		});
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}
}
