import { ConnectedPosition, Overlay, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, ElementRef, Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { ContextMenuContentComponent } from './components/context-menu-content/context-menu-content.component';
import {
  CloseContextMenuEvent,
  CloseLeafMenuEvent,
  IContextMenuClickEvent,
  IContextMenuContext,
  OverlayRefWithContextMenu,
} from './models/context-menu.model';

interface IFakeElement {
  getBoundingClientRect: () => DOMRect;
}

@Injectable()
export class ContextMenuService {
  public isDestroyingLeafMenu = false;

  public show: Subject<IContextMenuClickEvent> = new Subject();
  public close: Subject<CloseContextMenuEvent> = new Subject();

  private overlays: OverlayRef[] = [];
  private fakeElement: IFakeElement = {
    getBoundingClientRect: (): DOMRect => new DOMRect(0, 0, 0, 0),
  };

  private readonly rootMenuPositionsFor: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
    },
  ];

  private readonly subMenuPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'bottom',
    },
  ];

  constructor(private overlay: Overlay, private scrollStrategy: ScrollStrategyOptions) {}

  public openContextMenu(context: IContextMenuContext) {
    const { anchorElement, event, parentContextMenu } = context;

    if (!parentContextMenu) {
      const mouseEvent = event as MouseEvent;
      this.fakeElement.getBoundingClientRect = (): DOMRect => new DOMRect(mouseEvent.clientX, mouseEvent.clientY, 0, 0);

      this.closeAllContextMenus({ eventType: 'cancel', event });

      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(new ElementRef(anchorElement ?? this.fakeElement))
        .withPositions(this.rootMenuPositionsFor)
        .withFlexibleDimensions(false);
      this.overlays = [
        this.overlay.create({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: this.scrollStrategy.close(),
        }),
      ];
      this.attachContextMenu(this.overlays[0], context);
    } else {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(new ElementRef(event?.target ?? anchorElement))
        .withPositions(this.subMenuPositions)
        .withFlexibleDimensions(false);
      const newOverlay = this.overlay.create({
        positionStrategy,
        panelClass: 'ngx-contextmenu',
        scrollStrategy: this.scrollStrategy.close(),
      });
      this.destroySubMenus(parentContextMenu);
      this.overlays = this.overlays.concat(newOverlay);
      this.attachContextMenu(newOverlay, context);
    }
  }

  public attachContextMenu(overlay: OverlayRef, context: IContextMenuContext): void {
    const { event, item, menuItems, menuClass } = context;

    const contextMenuContent: ComponentRef<ContextMenuContentComponent> = overlay.attach(new ComponentPortal(ContextMenuContentComponent));
    const contentInstance = contextMenuContent.instance;
    contentInstance.event = event;
    contentInstance.item = item;
    contentInstance.menuItems = menuItems;
    contentInstance.overlay = overlay;
    contentInstance.isLeaf = true;
    contentInstance.menuClass = menuClass;
    (<OverlayRefWithContextMenu>overlay).contextMenu = contentInstance;

    const subscriptions: Subscription = new Subscription();
    subscriptions.add(contentInstance.execute.subscribe((executeEvent) => this.closeAllContextMenus({ eventType: 'execute', ...executeEvent })));
    subscriptions.add(
      contentInstance.closeAllMenus.subscribe((closeAllEvent) => this.closeAllContextMenus({ eventType: 'cancel', ...closeAllEvent })),
    );
    subscriptions.add(contentInstance.closeLeafMenu.subscribe((closeLeafMenuEvent) => this.destroyLeafMenu(closeLeafMenuEvent)));
    subscriptions.add(
      contentInstance.openSubMenu.subscribe((subMenuEvent: IContextMenuContext) => {
        this.destroySubMenus(contentInstance);
        if (!subMenuEvent.contextMenu) {
          contentInstance.isLeaf = true;
          return;
        }
        contentInstance.isLeaf = false;
        this.show.next(subMenuEvent);
      }),
    );
    contextMenuContent.onDestroy(() => {
      menuItems.forEach((menuItem) => (menuItem.isActive = false));
      subscriptions.unsubscribe();
    });
    contextMenuContent.changeDetectorRef.detectChanges();
  }

  public closeAllContextMenus(closeEvent: CloseContextMenuEvent): void {
    if (this.overlays?.length) {
      this.close.next(closeEvent);
      this.overlays.forEach((overlay) => this.destroyOverlay(overlay));
    }
    this.overlays = [];
  }

  public getLastAttachedOverlay(): OverlayRefWithContextMenu {
    let overlay: OverlayRef = this.overlays.at(-1);
    while (this.overlays.length > 1 && overlay && !overlay.hasAttached()) {
      this.destroyOverlay(overlay);
      this.overlays = this.overlays.slice(0, -1);
      overlay = this.overlays.at(-1);
    }
    return overlay;
  }

  public destroyLeafMenu({ exceptRootMenu, event }: CloseLeafMenuEvent = {}): void {
    if (this.isDestroyingLeafMenu) {
      return;
    }
    this.isDestroyingLeafMenu = true;

    setTimeout(() => {
      const overlay = this.getLastAttachedOverlay();
      if (this.overlays.length > 1 && overlay) {
        this.destroyOverlay(overlay);
      }
      if (!exceptRootMenu && this.overlays.length > 0 && overlay) {
        this.close.next({ eventType: 'cancel', event });
        this.destroyOverlay(overlay);
      }

      const newLeaf = this.getLastAttachedOverlay();
      if (newLeaf) {
        newLeaf.contextMenu.isLeaf = true;
      }

      this.isDestroyingLeafMenu = false;
    });
  }

  public destroySubMenus(contextMenu: ContextMenuContentComponent): void {
    const overlay = contextMenu.overlay;
    const index = this.overlays.indexOf(overlay);
    this.overlays.slice(index + 1).forEach((subMenuOverlay) => {
      this.destroyOverlay(subMenuOverlay);
    });
  }

  public isLeafMenu(contextMenuContent: ContextMenuContentComponent): boolean {
    const overlay = this.getLastAttachedOverlay();
    return contextMenuContent.overlay === overlay;
  }

  private destroyOverlay(overlay: OverlayRef): void {
    overlay.detach();
    overlay.dispose();
  }
}
