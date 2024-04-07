import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { CoreService } from '../core/core.service';

const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreService: CoreService,
    private apollo: Apollo
  ) {
    this.loginForm = this.fb.group({
      email: '',
      password: ''
    });
  }

  ngOnInit(): void {}

  onFormSubmit() {
    this.apollo
      .watchQuery({
        query: LOGIN_QUERY,
        variables: {
          email: this.loginForm.value.email,
          password: this.loginForm.value.password
        }
      })
      .valueChanges
      .pipe(
        catchError((error: any) => {
          console.error(error);
          const errorMessage = error.message ? error.message : 'Invalid credentials';
          this.coreService.openSnackBar(errorMessage);
          return EMPTY;
        })
      )
      .subscribe((response: any) => {
        // Assuming response.data.login contains token or user info
        const token = response.data.login.token;
        localStorage.setItem('token', token);
  
        // Redirect to the employee dashboard or any desired page
        this.router.navigateByUrl('/employees');
      });
  }
}
