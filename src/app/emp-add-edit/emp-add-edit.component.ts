import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { EmployeeService } from '../services/employee.service';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployeeById($id: ID!) {
    updateEmployeeById(id:, $id, employee: $employee){
      firstname
      lastname
      email
      gender
      salary
    } 
  }
`;

const ADD_EMPLOYEE_MUTATION = gql`
  mutation AddEmployee($employee: EmployeeInput!) {
    addEmployee(employee: $employee) {
      id
      firstname
      lastname
      email
      gender
      salary
    }
  }
`;

@Component({
  selector: 'app-emp-add-edit',
  templateUrl: './emp-add-edit.component.html',
  styleUrls: ['./emp-add-edit.component.scss'],
})
export class EmpAddEditComponent implements OnInit {
  empForm: FormGroup;
  emailError: any;

  constructor(
    private router: Router,
    private _fb: FormBuilder,
    private _empService: EmployeeService,
    private _dialogRef: MatDialogRef<EmpAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService,
    private apollo: Apollo
  ) {
    this.empForm = this._fb.group({
      firstname: '',
      lastname: '',
      email: '',
      gender: '',
      salary: '',
    });
  }

  ngOnInit(): void {
    this.empForm.patchValue(this.data);
  }

  onFormSubmit() {
    if (this.empForm.valid) {
      const employeeData = this.empForm.value;
      if (this.data) {
        employeeData.id = this.data.id;
      }

      const mutation = this.data ? UPDATE_EMPLOYEE_MUTATION : ADD_EMPLOYEE_MUTATION;
      const mutationVariables = this.data ? { id: employeeData.id, employee: employeeData } : { employee: employeeData };

      this.apollo
        .mutate({
          mutation,
          variables: mutationVariables,
        })
        .subscribe({
          next: (val: any) => {
            const message = this.data ? 'updated' : 'added';
            this._coreService.openSnackBar(`Employee ${message} successfully`);
            this._dialogRef.close(true);
            if (!this.data) {
              setTimeout(() => {
                window.location.reload();
              }, 1800);
            }
          },
          error: (err: any) => {
            console.error(err);
            const errorMessage = err?.error?.message || 'Failed to perform action';
            this._coreService.openSnackBar(errorMessage);
          },
        });
    }
  }
}