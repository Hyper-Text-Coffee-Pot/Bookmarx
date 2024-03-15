import { Component, Input, OnInit } from '@angular/core';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

	todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

	done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

	drop(event: CdkDragDrop<string[]>)
	{
		if (event.previousContainer === event.container)
		{
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else
		{
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			);
		}
	}
}
