import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthorService } from 'src/app/services/author.service';
import { Page } from 'src/app/shared/Page';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.css']
})
export class AuthorComponent implements OnInit {
  authors = [];
  rows = [];
  cols = [];
  page = new Page();
  control = true;
  controlAuthorForm = true;
  //form parameters
  AuthorForm: FormGroup;

  searchForm: FormGroup;
  message: string | undefined;
  constructor(private authorService: AuthorService,
              private alert: AlertifyService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.control = true;
    this.loadStaticPage();
  }

  loadStaticPage(){
    this.setPage({ offset: 0 });
    this.searchForm=  this.formBuilder.group({
      'name': [null, [Validators.minLength(3)]]
    });
    this.AuthorForm = this.formBuilder.group({
      'name': [null, [Validators.required]],
      'surname': [null, [Validators.required]],
      'about': [null, [Validators.required]],
      'email': [null, [Validators.email]],
      'phone': [null, [Validators.required]]
    });
  }

  loadAuthors(){
    this.authorService.getAll().subscribe(res => {
      this.authors = res;
    });
  }

  loadAuthorFormPanel(){
    this.controlAuthorForm=true;
    this.AuthorForm = this.formBuilder.group({
      'name': [null, [Validators.required]],
      'surname': [null, [Validators.required]],
      'about': [null, [Validators.required]],
      'email': [null, [Validators.email,Validators.required]],
      'phone': [null, [Validators.required]],
    });
  }

  setPage(pageInfo) {
    this.page.page = pageInfo.offset;
    this.authorService.getAllPageable(this.page).subscribe(pagedData => {
      this.page.size = pagedData.size;
      this.page.page = pagedData.page;
      this.page.totalElements = pagedData.totalElements;
      this.rows = pagedData.content;
    });
  }
  saveAuthor(){
    if (!this.AuthorForm.valid) {
      return;
    }
    this.authorService.post(this.AuthorForm.value).subscribe(
      res => {
      this.AuthorForm.reset();
      this.setPage({ offset: 0 });
      this.controlAuthorForm = false;
      this.message = 'Kay??t i??lemi ba??ar??l??.';
      this.alert.success( 'Kay??t i??lemi ba??ar??l??.');
      },
      error =>{
        this.alert.error('Kay??t i??lemi ba??ar??s??z <br/> Hata : ' + error);
        this.message = 'Kay??t i??lemi ba??ar??s??z';
      });
  }
  deleteAuthor(id){
    console.log(id);
    this.authorService.delete(id).subscribe(
      res=>{
        this.alert.success('Kayd??n??z silinmi??tir.');
        this.setPage({ offset: 0 });
        this.control = true;
        this.loadStaticPage();
      },
      error =>{
        this.alert.error('Kayd??n??z silinememi??tir..<br/>Hata : ' + error);
        this.loadStaticPage();
      }
    );
  }

  searchAuthor(){
    if (!this.searchForm.valid) {
      return;
    }
    this.authorService.findAllByName(this.searchForm.value['name']).subscribe(res => {
      this.authors = res;
      this.control = false;
      this.message = 'Kay??tlar bulunmu??tur.';
      this.alert.success('Kay??tlar bulunmu??tur.');
    }, 
    error =>{
      this.message = 'Herhangi bir kay??t bulunamam????t??r' ;
      this.alert.error('Herhangi bir kay??t bulunamam????t??r ');      
      this.control = true;
      this.loadStaticPage();
    });
  }

  get sf() { return this.searchForm.controls; }
  get f() { return this.AuthorForm.controls; }
}
