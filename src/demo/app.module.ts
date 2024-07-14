import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ContextMenuModule, ContextMenuService } from 'ngx-contextmenu';
import { AppComponent } from './app.component';
import { ChildOneComponent } from './components/child1/child1.component';
import { ChildTwoComponent } from './components/child2/child2.component';
import { ContextMenuAdapterComponent } from './components/context-menu-adapter/context-menu-adapter.component';
import { ChildThreeComponent } from './components/child3/child3.component';
import { DemoComponent } from './components/demo/demo.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, DemoComponent, ChildOneComponent, ChildTwoComponent, ChildThreeComponent, ContextMenuAdapterComponent],
  imports: [
    BrowserModule,
    CommonModule,
    ContextMenuModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          component: DemoComponent,
        },
        {
          path: 'one',
          component: ChildOneComponent,
        },
        {
          path: 'two',
          component: ChildTwoComponent,
        },
        {
          path: 'three',
          component: ChildThreeComponent,
        },
      ],
      {},
    ),
  ],
  providers: [ContextMenuService],
})
export class AppModule {}
