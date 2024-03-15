import { Component, Input, OnInit } from '@angular/core';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';

@Component({
	selector: 'app-bookmark-tree',
	templateUrl: './bookmark-tree.component.html',
	styleUrls: ['./bookmark-tree.component.scss']
})
export class BookmarkTreeComponent implements OnInit
{
	constructor() { }

	@Input()
	public BookmarkTreeNode: BookmarkTreeNode;

	ngOnInit(): void
	{

	}
}
