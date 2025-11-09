import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { EnvironmentProviders, ModuleWithProviders, NgModule, Provider, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';

import { ContextMenuContentComponent } from './components/context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuService } from './context-menu.service';
import { CONTEXT_MENU_OPTIONS } from './context-menu.tokens';
import { ContextMenuAttachDirective } from './directives/context-menu-attach.directive';
import { ContextMenuItemDirective } from './directives/context-menu-item.directive';
import { IContextMenuOptions } from './models/context-menu-options.model';

function buildContextMenuProviders(options?: IContextMenuOptions): Provider[] {
  return [
    ContextMenuService,
    {
      provide: CONTEXT_MENU_OPTIONS,
      useValue: options,
    },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ];
}

/** Modern alternative to the legacy `ContextMenuModule.forRoot()` pattern for standalone applications. */
export function provideContextMenu(options?: IContextMenuOptions): EnvironmentProviders {
  return makeEnvironmentProviders([importProvidersFrom(ContextMenuModule), ...buildContextMenuProviders(options)]);
}

@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [ContextMenuComponent, ContextMenuContentComponent, ContextMenuAttachDirective, ContextMenuItemDirective],
  exports: [ContextMenuComponent, ContextMenuAttachDirective, ContextMenuItemDirective],
})
export class ContextMenuModule {
  public static forRoot(options?: IContextMenuOptions): ModuleWithProviders<ContextMenuModule> {
    return {
      ngModule: ContextMenuModule,
      providers: buildContextMenuProviders(options),
    };
  }
}
