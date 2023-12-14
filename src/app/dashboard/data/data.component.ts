import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/shared/backend.service';
import { CHILDREN_PER_PAGE } from 'src/app/shared/constants';
import { StoreService } from 'src/app/shared/store.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  constructor(public storeService: StoreService, private backendService: BackendService) {}

  @Input() currentPage!: number;
  @Output() selectPageEvent = new EventEmitter<number>();
  public page: number = 0;

  // Add ViewChild for MatPaginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // MatTableDataSource for pagination
  dataSource = new MatTableDataSource<any>();

  ngOnInit(): void {
    this.backendService.getChildren(this.currentPage);
    this.dataSource.paginator = this.paginator;
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
    this.selectPageEvent.emit(currentPage);
    this.backendService.getChildren(currentPage);
  }

  returnAllPages(): number[] {
    const res = [];
    const pageCount = Math.ceil(this.storeService.childrenTotalCount / CHILDREN_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
      res.push(i + 1);
    }
    return res;
  }

  cancelRegistration(childId: string): void {
    this.backendService.deleteChildData(childId, this.currentPage);
  }
}
