import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { HomeComponent } from './views/home/home.component';
import { AuthGuardService } from './views/shared/guards/auth-guard.service';
import { LoginComponent } from './views/login/login.component';
import { ActiveAuthGuardService } from './views/shared/guards/active-auth-guard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent, canActivate: [AuthGuardService], data: { title: 'Home' } },
	{ path: 'login', component: LoginComponent, canActivate: [ActiveAuthGuardService], data: { title: 'Log In' } },
	{ path: '**', component: NotFoundComponent, data: { title: 'Not Found' } }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
