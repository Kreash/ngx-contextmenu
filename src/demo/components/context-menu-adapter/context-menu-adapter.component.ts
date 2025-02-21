import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ContextMenuComponent as NgxContextMenuComponent } from 'ngx-contextmenu';
import { ContextMenuOption, OptionActionEvent } from 'src/demo/models/context-menu-adapter.model';
import { ContextMenuAdapterSettings } from 'src/demo/models/context-menu.model';

@Component({
    selector: 'context-menu-adapter',
    templateUrl: './context-menu-adapter.component.html',
    styleUrls: ['./context-menu-adapter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ContextMenuAdapterComponent {
  @Input() options: ContextMenuOption[] | null = null;

  @Input() settings?: ContextMenuAdapterSettings;

  @Output() optionAction = new EventEmitter<OptionActionEvent>();

  @ViewChild('internalContextMenu', { static: true }) internalContextMenu: NgxContextMenuComponent;

  public isEnabled(option: ContextMenuOption, item: any) {
    if (typeof option.enabled === 'function') {
      return option.enabled(item);
    }
    return option.enabled;
  }

  onAction(option: ContextMenuOption, item: any) {
    if (this.settings?.isCustomAction) {
      this.optionAction.next({ option, item });
    } else {
      if (option.action !== undefined) {
        option.action(item);
      }
    }
  }
}
