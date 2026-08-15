# ngx-contextmenu

A context menu built with Angular (v22).

#### Supported Angular versions: 22, 21, 20, 19, 18, 17

#### Demo: https://kreash.github.io/ngx-contextmenu/

## Installation

```bash
npm i @kreash/ngx-contextmenu @angular/cdk
```

Register the providers once at the root of the application.

```ts
// Standalone
import { provideContextMenu } from '@kreash/ngx-contextmenu';

bootstrapApplication(AppComponent, {
  providers: [provideContextMenu()],
});
```

```ts
// NgModule
import { ContextMenuModule } from '@kreash/ngx-contextmenu';

@NgModule({
  imports: [ContextMenuModule.forRoot()],
})
export class AppModule {}
```

Then import `ContextMenuModule` wherever the menu is used — it exports the `<context-menu>` component
and the `contextMenu` / `contextMenuItem` directives.

```ts
@Component({
  selector: 'my-list',
  imports: [ContextMenuModule],
  templateUrl: './my-list.component.html',
})
export class MyListComponent {}
```

Make sure `<!doctype html>` is the first line of your `index.html`.

## Quick start

Attach a menu to any element with `[contextMenu]`, and pass the row it belongs to with
`[contextMenuSubject]`.

```html
<ul>
  @for (item of items; track item) {
    <li [contextMenu]="basicMenu" [contextMenuSubject]="item">Right Click: {{ item.name }}</li>
  }
</ul>

<context-menu #basicMenu>
  <ng-template contextMenuItem (execute)="showMessage('Hi, ' + $event.item.name)"> Say hi! </ng-template>
  <ng-template contextMenuItem [divider]="true"></ng-template>
  <ng-template contextMenuItem let-item (execute)="showMessage($event.item.name + ' said: ' + $event.item.otherProperty)"> Bye, {{ item?.name }} </ng-template>
  <ng-template contextMenuItem [passive]="true"> Input something: <input type="text" /> </ng-template>
</context-menu>
```

```ts
export class MyContextMenuClass {
  public items = [
    { name: 'John', otherProperty: 'Foo' },
    { name: 'Joe', otherProperty: 'Bar' },
  ];
}
```

`[contextMenu]` takes the component instance, so a template reference variable is usually all you need.
`@ViewChild` is only required when you open the menu from code.

## Menu items

Each item is an `<ng-template>` with the `contextMenuItem` directive. Add `let-item` to read the subject
inside the template. Use `item?.property` if the trigger has no `[contextMenuSubject]`, in which case
the subject is `undefined`.

| Input     | Type                           | Default | Description                                                                       |
| --------- | ------------------------------ | ------- | --------------------------------------------------------------------------------- |
| `divider` | `boolean`                      | `false` | Render a separator. `enabled`, `passive`, `subMenu` and `execute` are ignored, but `visible` still applies. |
| `passive` | `boolean`                      | `false` | Item emits no `execute` event and does not close the menu when clicked.           |
| `enabled` | `boolean \| (item) => boolean` | `true`  | Disabled items cannot be executed and are skipped by keyboard navigation.         |
| `visible` | `boolean \| (item) => boolean` | `true`  | Hide items based on the subject. Evaluated once, when the menu opens.             |
| `subMenu` | `ContextMenuComponent`         | —       | Open a nested menu instead of executing.                                          |

Disabled items only get a `disabled` class — the library ships no styling for it, so grey it out in
your own CSS.

The `execute` output emits `{ event: MouseEvent | KeyboardEvent, item }`.

Within the template you have access to everything in the outer component.

```html
<context-menu #menu>
  <ng-template contextMenuItem let-item [visible]="isMenuItemType1" [enabled]="false" (execute)="showMessage('Hi, ' + $event.item.name)">
    Say hi, {{ item?.name }}! <my-component [attribute]="item"></my-component>
    With access to the outside context: {{ outsideValue }}
  </ng-template>
</context-menu>
```

```ts
public outsideValue = 'something';

public isMenuItemType1(item: any): boolean {
  return item.type === 'type1';
}
```

### `visible` and `enabled` as functions

To reach component properties from inside these functions, use an arrow function.

```html
<ng-template ... [visible]="isMenuItemOutsideValue"></ng-template>
```

```ts
public outsideValue = 'something';

public isMenuItemOutsideValue = (item: any): boolean => {
  return item.type === this.outsideValue;
};
```

## Sub-menus

Point `[subMenu]` at another `<context-menu>`.

```html
<context-menu #basicMenu>
  <ng-template contextMenuItem [subMenu]="saySubMenu"> Say... </ng-template>
  <context-menu #saySubMenu>
    <ng-template contextMenuItem (execute)="showMessage('Hi, ' + $event.item.name)"> ...hi! </ng-template>
    <ng-template contextMenuItem (execute)="showMessage('Hola, ' + $event.item.name)"> ...hola! </ng-template>
  </context-menu>
  <ng-template contextMenuItem [divider]="true"></ng-template>
  <ng-template contextMenuItem let-item (execute)="showMessage($event.item.name + ' said: ' + $event.item.otherProperty)"> Bye, {{ item?.name }} </ng-template>
</context-menu>
```

1. The sub `<context-menu>` cannot be placed inside the `<ng-template>` that references it.
2. Sub-menus may be nested as deeply as you wish.

## Multiple menus

Any number of menus can live in the same component.

```html
<ul>
  @for (item of items; track item) {
    <li [contextMenu]="basicMenu" [contextMenuSubject]="item">{{ item.name }}</li>
  }
</ul>
<context-menu #basicMenu> ... </context-menu>

<ul>
  @for (item of items; track item) {
    <li [contextMenu]="otherMenu" [contextMenuSubject]="item">{{ item.name }}</li>
  }
</ul>
<context-menu #otherMenu> ... </context-menu>
```

## Opening a menu from code

When the `<context-menu>` lives in another component, or you want a trigger other than right-click,
push an event into `ContextMenuService.show` yourself.

```html
<ul>
  @for (item of items; track item) {
    <li (contextmenu)="onContextMenu($event, item)">Right Click: {{ item.name }}</li>
  }
</ul>
```

```ts
import { ContextMenuComponent, ContextMenuService } from '@kreash/ngx-contextmenu';

export class MyContextMenuClass {
  @Input() public contextMenu?: ContextMenuComponent;

  private readonly contextMenuService = inject(ContextMenuService);

  public onContextMenu($event: MouseEvent, item: any): void {
    this.contextMenuService.show.next({
      contextMenu: this.contextMenu,
      event: $event,
      item: item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }
}
```

The trigger is just a template binding, so `(click)`, `(keydown)`, `(mouseover)` or any custom event
works the same way.

**Always pass `contextMenu`** when the application contains more than one menu. Every
`<context-menu>` reacts to `show`, and each one that opens closes the previously opened menu — so
leaving it out does not open them all, it opens only the last one declared.

### Anchoring to an element

By default the menu opens at the mouse position. Pass `anchorElement` to attach it to an element
instead — useful when the trigger is not a mouse event.

```ts
public onContextMenu($event: KeyboardEvent, item: any): void {
  this.contextMenuService.show.next({
    anchorElement: $event.target,
    contextMenu: this.contextMenu,
    event: $event,
    item: item,
  });
  $event.preventDefault();
  $event.stopPropagation();
}
```

**Note:** items can only be declared in the template. You cannot pass an `actions` property to
`contextMenuService.show.next()`.

## `<context-menu>` inputs and outputs

| Input       | Type      | Default | Description                                   |
| ----------- | --------- | ------- | --------------------------------------------- |
| `menuClass` | `string`  | `''`    | Extra class on the menu wrapper.              |
| `disabled`  | `boolean` | `false` | Suppress the menu entirely.                   |

```html
<context-menu [menuClass]="'mystyle'" [disabled]="isDisabled"></context-menu>
```

A `menuClass` style has to be global, because the menu is rendered outside the component that
triggers it.

`(open)` emits when the menu opens, `(close)` when it closes — either because an item was executed or
because it was cancelled.

```html
<context-menu (open)="onOpen($event)" (close)="onClose($event)"></context-menu>
```

```ts
public onOpen(event: IContextMenuClickEvent): void {
  // { contextMenu?, event?, item, anchorElement?, ... }
}

public onClose(event: CloseContextMenuEvent): void {
  if (event.eventType === 'execute') {
    // { eventType: 'execute', event?, item, menuItem }
  } else {
    // { eventType: 'cancel', event? }
  }
}
```

`ContextMenuService.close` is the same stream that `(close)` forwards, available application-wide.
`ContextMenuService.show` is the stream you push into to open a menu, so subscribing to it tells you
whenever one is requested.

**Zoneless applications:** template bindings work as-is. If you subscribe programmatically and change
state in the handler, call `ChangeDetectorRef.markForCheck()` — some close paths emit from a timer.

## Global options

Options are set once, where the providers are registered.

```ts
provideContextMenu({ autoFocus: true });
// or
ContextMenuModule.forRoot({ autoFocus: true });
```

| Option      | Default | Description                                                                    |
| ----------- | ------- | ------------------------------------------------------------------------------ |
| `autoFocus` | `false` | Move focus to the menu when it opens, so Tab walks its items and any inputs.   |

**Note:** `<context-menu>` also declares an `autoFocus` input, but it is not forwarded to the rendered
menu and has no effect. Use the global option.

## Keyboard navigation

Key handlers are bound to `window`, so they work as soon as a menu is open — focus is not required and
`autoFocus` is not a prerequisite.

This also means the keys below stay active while you are typing in a passive item's `<input>`: Esc
still closes the menu and the arrows still move the highlight. What the library does in that case is
skip `preventDefault()`, so the keystroke reaches the field as well instead of being swallowed.

|      Key       | Action                                         |
| :------------: | ---------------------------------------------- |
|   ArrowDown    | Move to next menu item (wrapping)              |
|    ArrowUp     | Move to previous menu item (wrapping)          |
|   ArrowRight   | Open submenu of current menu item if present   |
|   ArrowLeft    | Close current menu unless already at root menu |
| Enter \| Space | Open submenu or execute current menu item      |
|      Esc       | Close current menu                             |

## Custom styles

The generated markup looks like this:

```html
<div class="dropdown open show ngx-contextmenu">
  <ul class="dropdown-menu show">
    <li>
      <a><!-- the template for each menu item goes here --></a>
      <span class="passive"><!-- the template for each passive menu item goes here --></span>
    </li>
  </ul>
</div>
```

Key off the `ngx-contextmenu` class, which is also present on the overlay panel that wraps the menu.
The `<li>` carries `active` while highlighted, `disabled` when not enabled and `divider` when it is a
separator; the `<a>` carries `active` and `hasSubMenu`. Positioning is handled by the CDK overlay, and
`ul.dropdown-menu` carries inline `position` and `float`.

```css
.ngx-contextmenu .dropdown-menu {
  border: solid 1px chartreuse;
  background-color: darkgreen;
  padding: 0;
}
.ngx-contextmenu li {
  display: block;
  border-top: solid 1px chartreuse;
  text-transform: uppercase;
  text-align: center;
}
.ngx-contextmenu li:first-child {
  border-top: none;
}
.ngx-contextmenu a {
  color: chartreuse;
  display: block;
  padding: 0.5em 1em;
}
.ngx-contextmenu a:hover {
  color: darkgreen;
  background-color: chartreuse;
}
```

## Dynamic menus

Items can be generated from data.

```html
<ul>
  @for (item of items; track item) {
    <li [contextMenu]="myContextMenu" [contextMenuSubject]="item">Right Click: {{ item.name }}</li>
  }
</ul>

<context-menu #myContextMenu>
  @for (action of contextMenuActions; track $index) {
    <ng-template contextMenuItem let-item [visible]="action.visible" [enabled]="action.enabled" [divider]="action.divider" (execute)="action.click($event.item)">
      {{ action.html(item) }}
    </ng-template>
  }
</context-menu>
```

```ts
export class MyContextMenuClass {
  public items = [
    { name: 'John', otherProperty: 'Foo', type: 'type1' },
    { name: 'Joe', otherProperty: 'Bar', type: 'type2' },
  ];

  public contextMenuActions = [
    {
      html: (item) => `Say hi!`,
      click: (item) => alert('Hi, ' + item.name),
      enabled: (item) => true,
      visible: (item) => item.type === 'type1',
    },
    {
      divider: true,
      visible: true,
    },
    {
      html: (item) => `Something else`,
      click: (item) => alert('Or not...'),
      enabled: (item) => false,
      visible: (item) => item.type === 'type1',
    },
  ];
}
```
