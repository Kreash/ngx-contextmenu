import { Component } from '@angular/core';

@Component({
    selector: 'ngx-context-menu-demo',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  protected readonly links = [
    { path: '/', label: 'home' },
    { path: '/one', label: 'one' },
    { path: '/two', label: 'two' },
    { path: '/three', label: 'three' },
  ];
}
