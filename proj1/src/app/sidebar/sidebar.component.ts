import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {

  hide = true;
  show = false;

  constructor() { }

  ngOnInit() {
  }

  toggleSideMenu() {
    this.hide = !this.hide;
    this.show = !this.show;
  }

}
