
export interface ContextMenuOption<TItem = any> {

  id?: string;

  label?: string;

  icon?: string | ((item: TItem) => string);

  iconDisabled?: string | ((item: TItem) => string);

  action?: (item: TItem) => void;

  enabled?: boolean | ((item: TItem) => boolean);

  visible?: boolean | ((item: TItem) => boolean);

  passive?: boolean;

  divider?: boolean;

  subMenu?: ContextMenuOption[];
}


export interface OptionActionEvent<TItem = any> {

  option: ContextMenuOption;

  item: TItem;
}
