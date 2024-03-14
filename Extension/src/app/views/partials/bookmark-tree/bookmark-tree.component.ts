import { Component, Input, OnInit } from '@angular/core';
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

	ngOnInit(): void
	{
	}

}
