import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BasePageDirective } from '../../shared/base-page.directive';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { UserCredential, sendEmailVerification } from '@angular/fire/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { GoogleAuthService } from 'src/app/domain/auth/services/google-auth.service';
import { BookmarxUser } from 'src/app/domain/auth/models/bookmarx-user';
import { IdentityActionResponseDto } from 'src/app/domain/membership/models/identity-action-response-dto';
import { MembershipAuthService } from 'src/app/domain/membership/services/membership-auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BasePageDirective
{
	@BlockUI()
	private _blockUI: NgBlockUI;
	private _recaptchaSubscription: Subscription;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _router: Router,
		private _metaService: Meta,
		private _membershipAuthService: MembershipAuthService,
		private _googleAuthService: GoogleAuthService,
		private _recaptchaV3Service: ReCaptchaV3Service)
	{
		super(_route, _titleService);
	}

	public FormError: string = "";
	public CurrentYear: string = "";

	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public SignInForm = new FormGroup({
		signInEmail: new FormControl('', [
			Validators.required,
			Validators.minLength(3)
		]),
		signInPassword: new FormControl('', [
			Validators.required,
			Validators.minLength(8)
		])
	});

	get SignInEmail() { return this.SignInForm.get('signInEmail'); }
	get SignInPassword() { return this.SignInForm.get('signInPassword'); }

	public override ngOnInit(): void
	{
		this._titleService.setTitle("Pictyrs | Log In");
		this._metaService.addTags([
			{ name: "description", content: "Log in to your Pictyrs account and start sharing photos, today." },
		]);

		let currentDate = new Date();
		this.CurrentYear = currentDate.getFullYear().toString();

		// If this request comes in from a google login then handle the final processing
		this._googleAuthService.ProcessRedirectResultFromGoogle(this._recaptchaSubscription)
			.then((bookmarxUser: BookmarxUser) =>
			{
				if (bookmarxUser)
				{
					this.SetUserDataAndRedirect(bookmarxUser);
				}
			}).catch((err: any) =>
			{
				// Handle all form errors here
				// https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=1#error-codes_12
				// auth/invalid-email
				// auth/user-disabled
				// auth/user-not-found
				// auth/wrong-password
				let errorCode = err.code; // A code
				let errorMessage = err.message; // And a message for the code
				this.FormError = err.message;
			});
	}

	/**
	 * Sign the user in, son!
	 */
	public ProcessSignIn(): void
	{
		// Reset any error messages
		this.FormError = "";
		this._blockUI.start("Signing in...");

		this._recaptchaSubscription = this._recaptchaV3Service.execute('login_action')
			.subscribe({
				next: (reCAPTCHAToken: string) =>
				{
					this._authService.SignInWithEmailAndPassword(this.SignInEmail?.value, this.SignInPassword?.value)
						.then((res: UserCredential) =>
						{
							// Send a confirmation email if not verified after they signed up.
							if (!res.user.emailVerified)
							{
								sendEmailVerification(res.user);
								this.FormError = "Please check your email for a verification then try again.";
								this._blockUI.stop();
								return;
							}

							res.user.getIdToken()
								.then((authToken: string) =>
								{
									this._membershipAuthService.SignInWithEmailAndPassword(authToken, res.user.uid, reCAPTCHAToken)
										.subscribe((response: IdentityActionResponseDto) =>
										{
											let bookmarxUser: BookmarxUser = new BookmarxUser();
											bookmarxUser.User = res.user;
											bookmarxUser.OGID = response.OGID;
											bookmarxUser.IsSubscriptionValid = response.IsSubscriptionValid;
											this.SetUserDataAndRedirect(bookmarxUser);
											this._blockUI.stop();
										});
								});
						}).catch((err: any) =>
						{
							// Handle all form errors here
							// https://firebase.google.com/docs/reference/js/firebase.auth.Auth?authuser=1#error-codes_12
							// auth/invalid-email
							// auth/user-disabled
							// auth/user-not-found
							// auth/wrong-password
							let errorCode = err.code; // A code
							//let errorMessage = err.message; // And a message for the code
							let errorMessage = ""; // And a message for the code

							switch (errorCode)
							{
								// Any error just tell em the password or email is wrong
								case "auth/invalid-email":
								case "auth/wrong-password":
								case "auth/user-not-found":
								case "auth/user-disabled":
									errorMessage = "Email or password incorrect.";
									break;
							}

							this.FormError = errorMessage;
							this._blockUI.stop();
						});
				},
				error: () =>
				{
					this._blockUI.stop();
				}
			});
	}

	public ProcessSignInWithGoogle(): void
	{
		// Reset any error messages
		this.FormError = "";

		this._authService.InitiateSignInWithGoogle();
	}

	public ngOnDestroy()
	{
		this._recaptchaSubscription != undefined ?? this._recaptchaSubscription.unsubscribe();
	}

	private SetUserDataAndRedirect(bookmarxUser: BookmarxUser): void
	{
		// Need to manually set the data so the auth guard works
		this._authService.SetUserData(bookmarxUser);
		this._router.navigate(['/']);
	}
}
