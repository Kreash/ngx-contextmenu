import { InjectionToken } from '@angular/core';
import { IContextMenuOptions } from './models/context-menu-options.model';

export const CONTEXT_MENU_OPTIONS = new InjectionToken<IContextMenuOptions | null>('CONTEXT_MENU_OPTIONS');
