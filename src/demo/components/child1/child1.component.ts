import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'child-one',
    templateUrl: './child1.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
