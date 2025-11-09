import { Highlightable } from '@angular/cdk/a11y';
import { Directive, ElementRef, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { evaluateIfFunction } from '../utils/context-menu.utils';

@Directive({
  selector: '[contextMenuItem]',
  standalone: false,
})
export class ContextMenuItemDirective<TItem = any> implements Highlightable {
  @Input() public subMenu: any;
  @Input() public divider = false;
  @Input() public enabled: boolean | ((item: TItem) => boolean) = true;
  @Input() public passive = false;
  @Input() public visible: boolean | ((item: TItem) => boolean) = true;
  @Output() public execute: EventEmitter<{
    event: MouseEvent | KeyboardEvent;
    item: TItem;
  }> = new EventEmitter();

  public currentItem: TItem;
  public isActive = false;
  public get disabled() {
    return this.passive || this.divider || !evaluateIfFunction(this.enabled, this.currentItem);
  }

  constructor(public template: TemplateRef<{ item: TItem }>, public elementRef: ElementRef) {}

  public setActiveStyles(): void {
    this.isActive = true;
  }
  public setInactiveStyles(): void {
    this.isActive = false;
  }

  public triggerExecute(item: TItem, $event?: MouseEvent | KeyboardEvent): void {
    if (!evaluateIfFunction(this.enabled, item)) {
      return;
    }
    this.execute.emit({ event: $event, item });
  }
}
