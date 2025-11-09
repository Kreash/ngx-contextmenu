import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { IContextMenuOptions } from '../../models/context-menu-options.model';
import { CloseLeafMenuEvent, IContextMenuClickEvent } from '../../models/context-menu.model';
import { CONTEXT_MENU_OPTIONS } from '../../context-menu.tokens';
import { ContextMenuItemDirective } from '../../directives/context-menu-item.directive';
import { evaluateIfFunction } from '../../utils/context-menu.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ILinkConfig {
  click: (item: any, $event?: MouseEvent) => void;
  enabled?: (item: any) => boolean;
  html: (item: any) => string;
}

const ARROW_LEFT_KEY = 'ArrowLeft';

@Component({
  selector: 'context-menu-content',
  styleUrls: ['./context-menu-content.component.scss'],
  templateUrl: './context-menu-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ContextMenuContentComponent implements OnInit, AfterViewInit {
  @Input() public menuItems: ContextMenuItemDirective[] = [];
  @Input() public item: any;
  @Input() public event: MouseEvent | KeyboardEvent;
  @Input() public parentContextMenu: ContextMenuContentComponent;
  @Input() public menuClass: string;
  @Input() public overlay: OverlayRef;
  @Input() public isLeaf = false;
  @Output() public execute: EventEmitter<{
    event: MouseEvent | KeyboardEvent;
    item: any;
    menuItem: ContextMenuItemDirective;
  }> = new EventEmitter();
  @Output() public openSubMenu: EventEmitter<IContextMenuClickEvent> = new EventEmitter();
  @Output() public closeLeafMenu: EventEmitter<CloseLeafMenuEvent> = new EventEmitter();
  @Output() public closeAllMenus: EventEmitter<{
    event: MouseEvent;
  }> = new EventEmitter();
  @ViewChild('menu', { static: true }) public menuElement: ElementRef;
  @ViewChildren('li') public menuItemElements: QueryList<ElementRef>;

  public autoFocus = false;
  public useBootstrap4 = false;
  private _keyManager: ActiveDescendantKeyManager<ContextMenuItemDirective>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly options = inject<IContextMenuOptions | null>(CONTEXT_MENU_OPTIONS, { optional: true });

  constructor() {
    if (this.options) {
      this.autoFocus = this.options.autoFocus;
      this.useBootstrap4 = this.options.useBootstrap4;
    }
  }

  ngOnInit(): void {
    for (const menuItem of this.menuItems) {
      menuItem.currentItem = this.item;
      menuItem.execute.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => this.execute.emit({ ...event, menuItem }));
    }
    const queryList = new QueryList<ContextMenuItemDirective>();
    queryList.reset(this.menuItems);
    this._keyManager = new ActiveDescendantKeyManager<ContextMenuItemDirective>(queryList).withWrap();
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      setTimeout(() => this.focus());
    }
    this.overlay.updatePosition();
  }

  focus(): void {
    if (this.autoFocus) {
      this.menuElement.nativeElement.focus();
    }
  }

  stopEvent($event: MouseEvent) {
    $event.stopPropagation();
  }

  public isMenuItemEnabled(menuItem: ContextMenuItemDirective): boolean {
    return evaluateIfFunction(menuItem?.enabled, this.item);
  }

  public isMenuItemVisible(menuItem: ContextMenuItemDirective): boolean {
    return evaluateIfFunction(menuItem?.visible, this.item);
  }

  public isDisabled(link: ILinkConfig): boolean {
    return link.enabled && !link.enabled(this.item);
  }

  @HostListener('window:keydown.ArrowDown', ['$event'])
  @HostListener('window:keydown.ArrowUp', ['$event'])
  public onKeyEvent(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }
    this._keyManager.onKeydown(event);
  }

  @HostListener('window:keydown.ArrowRight', ['$event'])
  public keyboardOpenSubMenu(event?: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }
    this.cancelEvent(event);
    const menuItem = this.menuItems[this._keyManager.activeItemIndex];
    if (menuItem) {
      this.onOpenSubMenu(menuItem);
    }
  }

  @HostListener('window:keydown.Enter', ['$event'])
  @HostListener('window:keydown.Space', ['$event'])
  public keyboardMenuItemSelect(event?: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }
    this.cancelEvent(event);
    const menuItem = this.menuItems[this._keyManager.activeItemIndex];
    if (menuItem) {
      this.onMenuItemSelect(menuItem, event);
    }
  }

  @HostListener('window:keydown.Escape', ['$event'])
  @HostListener('window:keydown.ArrowLeft', ['$event'])
  public onCloseLeafMenu(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }
    this.cancelEvent(event);
    this.closeLeafMenu.emit({
      exceptRootMenu: event.key === ARROW_LEFT_KEY,
      event,
    });
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:contextmenu', ['$event'])
  public closeMenu(event: MouseEvent): void {
    if (event.type === 'click' && event.button === 2) {
      return;
    }
    this.closeAllMenus.emit({ event });
  }

  public onOpenSubMenu(menuItem: ContextMenuItemDirective, event?: MouseEvent | KeyboardEvent): void {
    const anchorElementRef = this.menuItemElements.toArray()[this._keyManager.activeItemIndex];
    const anchorElement = anchorElementRef?.nativeElement;
    this.openSubMenu.emit({
      anchorElement,
      contextMenu: menuItem.subMenu,
      event,
      item: this.item,
      parentContextMenu: this,
    });
  }

  public onMenuItemSelect(menuItem: ContextMenuItemDirective, event: MouseEvent | KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.onOpenSubMenu(menuItem, event);
    if (!menuItem.subMenu) {
      menuItem.triggerExecute(this.item, event);
    }
  }

  private cancelEvent(event): void {
    if (!event) {
      return;
    }

    const target: HTMLElement = event.target;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}
