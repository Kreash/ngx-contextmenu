import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ContextMenuContentComponent } from './components/context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { IContextMenuOptions } from './models/context-menu-options.model';
import { ContextMenuService } from './context-menu.service';
import { CONTEXT_MENU_OPTIONS } from './context-menu.tokens';
import { ContextMenuAttachDirective } from './directives/context-menu-attach.directive';
import { ContextMenuItemDirective } from './directives/context-menu-item.directive';

@NgModule({
  declarations: [ContextMenuComponent, ContextMenuContentComponent, ContextMenuAttachDirective, ContextMenuItemDirective],
  exports: [ContextMenuComponent, ContextMenuAttachDirective, ContextMenuItemDirective],
  imports: [CommonModule, OverlayModule],
})
export class ContextMenuModule {
  public static forRoot(options?: IContextMenuOptions): ModuleWithProviders<ContextMenuModule> {
    return {
      ngModule: ContextMenuModule,
      providers: [
        ContextMenuService,
        {
          provide: CONTEXT_MENU_OPTIONS,
          useValue: options,
        },
        { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
      ],
    };
  }
}
