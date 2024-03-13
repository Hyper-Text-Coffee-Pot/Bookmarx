export class Bookmark
{
	constructor(title: string, url: string)
	{
		this.Title = title;
		this.URL = url;
	}

	public DateTimeAddedUTC: string;

	public Description: string;

	public Note: string;

	public Title: string;

	public URL: string;
}