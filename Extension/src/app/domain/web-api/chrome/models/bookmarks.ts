import { IChild } from "./child";

export interface IBookmarks extends Array<IChild>
{
	dateAdded: any;
	id: string;
	index: number;
	parentId: string;
	title: string;
	url: string;
	children: IChild[];
	dateGroupModified?: number;
}