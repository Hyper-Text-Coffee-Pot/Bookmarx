import { Component } from '@angular/core';
import { BasePageDirective } from '../../shared/base-page.directive';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { BookmarxUser } from 'src/app/services/auth/models/bookmarx-user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GoogleAuthService } from 'src/app/services/auth/services/google-auth.service';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
})
export class SignupComponent extends BasePageDirective
{
	@BlockUI()
	private _blockUI: NgBlockUI;
	private _recaptchaSubscription: Subscription;
	private _ig: string;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _recaptchaV3Service: ReCaptchaV3Service,
		private _authService: AuthService,
		private _router: Router,
		private _googleAuthService: GoogleAuthService)
	{
		super(_route, _titleService);
	}

	//#region Properties

	public FormError: string = "";
	public CurrentYear: string = "";

	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public SignUpForm = new FormGroup({
		signUpEmail: new FormControl('', [
			Validators.required,
			Validators.minLength(3)
		]),
		signUpPassword: new FormControl('', [
			Validators.required,
			Validators.minLength(8)
		]),
		signUpFirstName: new FormControl('', [
			Validators.required,
			Validators.minLength(1)
		]),
		signUpLastName: new FormControl('', [
			Validators.required,
			Validators.minLength(1)
		]),
	});

	get SignUpEmail() { return this.SignUpForm.get('signUpEmail'); }
	get SignUpPassword() { return this.SignUpForm.get('signUpPassword'); }
	get SignUpFirstName() { return this.SignUpForm.get('signUpFirstName'); }
	get SignUpLastName() { return this.SignUpForm.get('signUpLastName'); }

	//#endregion Properties

	public override	ngOnInit(): void
	{
		this._ig = this._route.snapshot.paramMap.get('ig');

		// If this request comes in from a google login then handle the final processing
		this._googleAuthService.ProcessRedirectResultFromGoogle(this._recaptchaSubscription, this._ig)
			.then((pictyrsUser: PictyrsUser) =>
			{
				if (pictyrsUser)
				{
					this.SetUserDataAndRedirect(pictyrsUser);
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

	public ngOnDestroy()
	{
		this._recaptchaSubscription != undefined ?? this._recaptchaSubscription.unsubscribe();
	}

	/**
	 * Process the sign up and update some basic user info.
	 * https://firebase.google.com/docs/reference/js/v8/firebase.User?authuser=1#updateprofile
	 */
	public ProcessSignUpWithEmailAndPassword(): void
	{
		this._blockUI.start();

		// Reset any error messages
		this.FormError = "";

		let signupEmail = this.SignUpEmail?.value.trim();
		let firstName = this.SignUpFirstName?.value.trim();
		let lastName = this.SignUpLastName?.value.trim();
		let signupPassword = this.SignUpPassword?.value.trim();

		this._authService.SignUpWithEmailAndPassword(
			signupEmail,
			signupPassword
		)
			.then((res: UserCredential) =>
			{
				// Send a confirmation email right away.
				sendEmailVerification(res.user);

				res.user.getIdToken()
					.then((token: string) =>
					{
						if (token != "")
						{
							this._recaptchaSubscription = this._recaptchaV3Service.execute("signup_action")
								.subscribe({
									next: (reCAPTCHAToken: string) =>
									{
										// After signup we don't care that they verify their email, next time they 
										// log in they'll be asked to verify it. Just make it easy right now.
										// Need to manually set the data so the auth guard works
										// Immediately update the users first and last name
										let memberAccountCreateRequest = new MemberAccountCreateRequest();
										memberAccountCreateRequest.AccessToken = token;
										memberAccountCreateRequest.APID = res.user.uid;
										memberAccountCreateRequest.EmailAddress = signupEmail;
										memberAccountCreateRequest.FirstName = firstName;
										memberAccountCreateRequest.LastName = lastName;
										memberAccountCreateRequest.ReCAPTCHAToken = reCAPTCHAToken;
										memberAccountCreateRequest.IG = this._ig ?? "";

										this._membershipAuthService.CreateNewMemberAccount(memberAccountCreateRequest)
											.subscribe((response: IdentityActionResponseDto) =>
											{
												const fullName = `${ firstName } ${ lastName }`;

												let pictyrsUser: PictyrsUser = new PictyrsUser();
												pictyrsUser.User = res.user;
												pictyrsUser.OGID = response.OGID;
												pictyrsUser.IsSubscriptionValid = response.IsSubscriptionValid;

												this._authService.UpdateDisplayName(pictyrsUser, fullName)
													.then(() =>
													{
														this.SetUserDataAndRedirect(pictyrsUser);
													});
											});
									},
									complete: () =>
									{
										this._blockUI.stop();
									}
								});
						}
					});
			}).catch((err: any) =>
			{
				// Handle all form errors here
				// https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#createuserwithemailandpassword
				let errorCode = err.code; // A code
				let errorMessage = ""; // And a message for the code

				switch (errorCode)
				{
					// Any error just tell em the password or email is wrong
					case "auth/email-already-in-use":
						errorMessage = "Email is already in use, please try logging in.";
						break;
					case "auth/invalid-email":
						errorMessage = "Invalid email, please enter a valid email.";
						break;
					case "auth/operation-not-allowed":
						errorMessage = "Oops, something went wrong, please contact us for support.";
						break;
					case "auth/weak-password":
						errorMessage = "Your password is not strong enough.";
						break;
				}

				this.FormError = errorMessage;
			});
	}

	public ProcessSignUpWithGoogle(): void
	{
		// Reset any error messages
		this.FormError = "";

		this._authService.InitiateSignInWithGoogle();
	}

	private SetUserDataAndRedirect(pictyrsUser: BookmarxUser): void
	{
		// Need to manually set the data so the auth guard works
		this._authService.SetUserData(pictyrsUser);
		this._router.navigate(['/']);
	}
}