import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpAddEditComponent } from '../emp-add-edit/emp-add-edit.component';
import { EmpViewComponent } from '../emp-view/emp-view.component';
import { EmployeeService } from '../services/employee.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from '../core/core.service';
import { Employee } from '../../models/Employee';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

const GET_EMPLOYEES = gql`
  query {
    getAllEmployees {
      id
      firstname
      lastname
      email
      gender
      salary
    }
  }
`;

const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployeeById($id: ID!) {
    deleteEmployeeById(id: $id)
  }
`;

@Component({
  selector: 'app-view-employees-list',
  templateUrl: './view-employees-list.component.html',
  styleUrls: ['./view-employees-list.component.scss']
})
export class ViewEmployeesListComponent implements OnInit {
  displayedColumns: string[] = [
    'index',
    'firstName',
    'lastName',
    'email',
    'gender',
    'salary',
    'action'
  ];
  employees: Employee[] = [];
  dataSource!: MatTableDataSource<any>;
  isLoading!: boolean;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private _dialog: MatDialog,
    private _empService: EmployeeService,
    private _coreService: CoreService,
    private authService: AuthService,
    private apollo: Apollo
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    this.getEmployeeList();
  }

  openAddEditEmpForm() {
    const dialogRef = this._dialog.open(EmpAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          setTimeout(() => {
            window.location.reload();
          }, 1800);
          this.getEmployeeList();
        }
      },
    });
  }

  viewEmployeeDetail(id: number) {
    const dialogRef = this._dialog.open(EmpViewComponent, {
      data: { id },
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this._coreService.openSnackBar('You have Loged Out!', 'ok');
  }

  getEmployeeList() {
    this.apollo.watchQuery<any>({
      query: GET_EMPLOYEES
    }).valueChanges
    .subscribe(({data, loading}) => {
      console.log(loading);
      this.isLoading = loading
      this.employees = data.getAllEmployees; 
      console.log(data)
      this.dataSource = new MatTableDataSource( this.employees);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  deleteEmployee(id: string) {
    this.apollo
      .mutate({
        mutation: DELETE_EMPLOYEE_MUTATION,
        variables: { id: id }
      })
      .subscribe({
        next: (res) => {
          this._coreService.openSnackBar('Employee deleted!', 'ok');
          this.employees = this.employees.filter(emp => emp.id !== id);
          this.dataSource = new MatTableDataSource(this.employees);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        error: (err) => {
          console.error(err);
          this._coreService.openSnackBar('Failed to delete employee');
        }
      });
  }
  

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(EmpAddEditComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }
}
