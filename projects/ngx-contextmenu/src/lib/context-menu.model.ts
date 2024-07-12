import { OverlayRef } from '@angular/cdk/overlay';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuItemDirective } from './directives/context-menu-item.directive';
import { ContextMenuContentComponent } from './components/context-menu-content/context-menu-content.component';

export interface IContextMenuClickEvent {
  anchorElement?: Element | EventTarget;
  contextMenu?: ContextMenuComponent;
  event?: MouseEvent | KeyboardEvent;
  parentContextMenu?: ContextMenuContentComponent;
  item: any;
  activeMenuItemIndex?: number;
}
export interface IContextMenuContext extends IContextMenuClickEvent {
  menuItems: ContextMenuItemDirective[];
  menuClass: string;
}
export interface CloseLeafMenuEvent {
  exceptRootMenu?: boolean;
  event?: MouseEvent | KeyboardEvent;
}
export interface OverlayRefWithContextMenu extends OverlayRef {
  contextMenu?: ContextMenuContentComponent;
}

export interface CancelContextMenuEvent {
  eventType: 'cancel';
  event?: MouseEvent | KeyboardEvent;
}
export interface ExecuteContextMenuEvent {
  eventType: 'execute';
  event?: MouseEvent | KeyboardEvent;
  item: any;
  menuItem: ContextMenuItemDirective;
}
export type CloseContextMenuEvent = ExecuteContextMenuEvent | CancelContextMenuEvent;
