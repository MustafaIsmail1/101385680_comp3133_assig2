import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

const SIGNUP_MUTATION = gql`
  mutation Signup($user: UserInput!) {
    signup(user: $user) {
      id
      username
      email
    }
  }
`;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apollo: Apollo
  ) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onFormSubmit() {
    if (this.signUpForm.invalid) {
      return;
    }

    const { username, email, password } = this.signUpForm.value;
    this.apollo.mutate({
      mutation: SIGNUP_MUTATION,
      variables: {
        user: {
          username,
          email,
          password
        }
      }
    }).pipe(
      catchError((error: any) => {
        console.error(error);
        const errorMessage = error.message || 'Unknown error';
        console.log(errorMessage);
        // Handle error here
        return EMPTY;
      })
    ).subscribe((result: any) => {
      console.log('User added successfully', result);
      this.router.navigateByUrl('/login');
    });
  }
}
