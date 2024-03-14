import { Component, Input, OnInit } from '@angular/core';
import { Options } from 'sortablejs';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';

@Component({
	selector: 'app-bookmark-tree',
	templateUrl: './bookmark-tree.component.html',
	styleUrls: ['./bookmark-tree.component.scss']
})
export class BookmarkTreeComponent implements OnInit
{

	constructor() { }

	@Input()
	public BookmarkCollection: BookmarkCollection = null;
	public Options: Options = {
		animation: 150,
		group: 'nested',
		fallbackOnBody: true,
		swapThreshold: 0.65
	};

	ngOnInit(): void
	{
		this.Options = {
			onChange: (event: any) =>
			{
				console.log(event);
			}
		};
	}

}
