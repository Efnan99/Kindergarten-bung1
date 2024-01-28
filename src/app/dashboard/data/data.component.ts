import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/shared/backend.service';
import { CHILDREN_PER_PAGE } from 'src/app/shared/constants';
import { StoreService } from 'src/app/shared/store.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {
  constructor(public storeService: StoreService, private backendService: BackendService) {}

  @Input() currentPage!: number;
  @Output() selectPageEvent = new EventEmitter<number>();
  public page: number = 0;
  public isLoading: boolean = false;

  // Add ViewChild for MatPaginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // MatTableDataSource for pagination
  dataSource = new MatTableDataSource<any>();

  // Add properties to track the sorting direction
  public isNameSortedAscending: boolean = true;
  public isBirthdateSortedAscending: boolean = true;

  ngOnInit(): void {
    this.loadChildren();
  }

  private async loadChildren(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.backendService.getChildren(this.currentPage);
      if (response instanceof HttpResponse) {
        const data = response.body || [];
        const totalCount = response.headers.get('X-Total-Count') || '0';
        this.storeService.children = data;
        this.storeService.childrenTotalCount = Number(totalCount);

        // Update MatTableDataSource with filtered and sorted data
        this.dataSource = new MatTableDataSource<any>(this.storeService.children);
        this.dataSource.paginator = this.paginator;

        // Sort data initially based on name
        this.sortByName();
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getAge(birthDate: string): number {
    const today = new Date();
    const birthDateTimestamp = new Date(birthDate);
    let age = today.getFullYear() - birthDateTimestamp.getFullYear();
    const m = today.getMonth() - birthDateTimestamp.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDateTimestamp.getDate())) {
      age--;
    }
    return age;
  }

  selectPage(i: number): void {
    let currentPage = i;
    this.isLoading = true;
    this.selectPageEvent.emit(currentPage);
    this.loadChildren();
  }

  returnAllPages(): number[] {
    const res = [];
    const pageCount = Math.ceil(this.storeService.childrenTotalCount / CHILDREN_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
      res.push(i + 1);
    }
    return res;
  }

  async cancelRegistration(childId: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.backendService.deleteChildData(childId, this.currentPage);
      this.loadChildren();
    } catch (error) {
      console.error('Error canceling registration:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilter(event: any): void {
    const filterValue = (event?.target as HTMLInputElement)?.value.trim().toLowerCase();
    this.dataSource.filter = filterValue || '';
  }

  sortByName(): void {
    console.log('Sort by name clicked!');
    this.isNameSortedAscending = !this.isNameSortedAscending;

    this.storeService.children.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      let result: number;
      if (nameA < nameB) {
        result = this.isNameSortedAscending ? -1 : 1;
      } else if (nameA > nameB) {
        result = this.isNameSortedAscending ? 1 : -1;
      } else {
        result = 0;
      }

      return result;
    });

    this.updateDataSource();
  }

  sortByBirthdate(): void {
    console.log('Sort by birthdate clicked!');
    this.isBirthdateSortedAscending = !this.isBirthdateSortedAscending;

    this.storeService.children.sort((a, b) => {
      const birthdateA = new Date(a.birthDate);
      const birthdateB = new Date(b.birthDate);

      let result: number;
      if (birthdateA < birthdateB) {
        result = this.isBirthdateSortedAscending ? -1 : 1;
      } else if (birthdateA > birthdateB) {
        result = this.isBirthdateSortedAscending ? 1 : -1;
      } else {
        result = 0;
      }

      return result;
    });

    this.updateDataSource();
  }

  updateDataSource(): void {
    // Update MatTableDataSource with sorted data
    this.dataSource = new MatTableDataSource<any>(this.storeService.children);
    this.dataSource.paginator = this.paginator;
  }
}
