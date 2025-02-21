import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'child-two',
    templateUrl: './child2.component.html',
    standalone: false
})
export class ChildTwoComponent {
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
