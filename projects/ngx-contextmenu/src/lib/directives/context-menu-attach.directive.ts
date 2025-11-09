import { ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { ContextMenuService } from '../context-menu.service';
import { Directive, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[contextMenu]',
  standalone: false,
})
export class ContextMenuAttachDirective {
  @Input() public contextMenuSubject: any;
  @Input() public contextMenu: ContextMenuComponent;

  private readonly contextMenuService = inject(ContextMenuService);

  @HostListener('contextmenu', ['$event'])
  public onContextMenu(event: MouseEvent): void {
    if (!this.contextMenu.disabled) {
      this.contextMenuService.show.next({
        contextMenu: this.contextMenu,
        event,
        item: this.contextMenuSubject,
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
