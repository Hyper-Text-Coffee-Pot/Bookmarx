import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { HomeComponent } from './views/home/home.component';
import { BasePageDirective } from './views/shared/base-page.directive';
import { LoginComponent } from './views/login/login.component';

@NgModule({
	declarations: [
		AppComponent,
		NotFoundComponent,
		HomeComponent,
		BasePageDirective,
		LoginComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
