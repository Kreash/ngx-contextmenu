import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'child-one',
    templateUrl: './child1.component.html',
    standalone: false
})
export class ChildOneComponent {
  @Input() testParam: boolean;

  public items: any[] = [
    {
      name: 'One',
      url: '/one',
    },
    {
      name: 'Two',
      url: '/two',
    },
  ];

  constructor(private router: Router) {}

  showMessage(message: any) {
    console.log(message);
  }

  go(item: any) {
    this.router.navigateByUrl(item.url);
  }
}
