import { Component, ViewChild } from '@angular/core';
import { ContextMenuOption } from 'src/demo/models/context-menu-adapter.model';
import { ContextMenuAdapterSettings } from 'src/demo/models/context-menu.model';
import { ContextMenuAdapterComponent } from '../context-menu-adapter/context-menu-adapter.component';
import { ContextMenuService } from 'ngx-contextmenu';

@Component({
    selector: 'child-three',
    templateUrl: './child3.component.html',
    standalone: false
})
export class ChildThreeComponent {
  @ViewChild('contextMenu') contextMenu: ContextMenuAdapterComponent;

  public readonly settings: ContextMenuAdapterSettings = {};

  public get options(): ContextMenuOption[] {
    return [
      {
        id: 'insertText',
        label: 'Вставка:',
        visible: true,
        enabled: true,
        passive: true,
      },
      {
        divider: true,
        visible: true,
      },
      {
        id: 'first',
        label: 'first',
        enabled: true,
        visible: true,
        subMenu: [
          {
            id: 'subEl',
            label: 'subEl',
            enabled: true,
          },
          {
            id: 'subEl2',
            label: 'subEl2',
            enabled: true,
            visible: true,
          },
          {
            id: 'subEl3',
            label: 'subEl3',
            enabled: true,
          },
        ],
      },
      {
        id: 'second',
        label: 'second',
        visible: true,
        enabled: true,
      },
      {
        divider: true,
        visible: true,
      },
      {
        divider: true,
        visible: true,
      },
      {
        id: 'copy',
        label: 'copy',
        visible: true,
        enabled: true,
      },
      {
        id: 'cut',
        label: 'cut',
        visible: true,
        enabled: true,
      },
      {
        id: 'paste',
        label: 'paste',
        visible: true,
        enabled: true,
      },
      {
        divider: true,
        visible: true,
      },
      {
        id: 'delete',
        label: 'delete',
        enabled: false,
        visible: true,
      },
      {
        divider: true,
        visible: true,
      },
    ];
  }

  constructor(private contextMenuService: ContextMenuService) {}

  showMessage(message: any) {
    console.log(message);
  }

  public openContextMenu(event: PointerEvent) {
    console.log('openContextMenu', event);
    this.contextMenuService.show.next({
      contextMenu: this.contextMenu.internalContextMenu,
      event: event,
      item: event.target,
    });
    event.preventDefault();
    event.stopPropagation();
  }
}
