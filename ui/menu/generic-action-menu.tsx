import { twMerge } from "@/modules/functions/css";
import { ReactNode } from "react";
import Button from "../buttons/button";
import GenericMenu, { GenericMenuProps, GenericMenuItem } from "./generic-menu";

type GenericActionMenuItem = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  closeMenuOnClick?: boolean;
};

type GenericActionMenuProps = Omit<GenericMenuProps, "items"> & {
  items: GenericActionMenuItem[];
};

export default function GenericActionMenu({
  items,
  ...rest
}: GenericActionMenuProps) {
  /**
   * Convert the items to the format that GenericMenu expects
   */
  const _items = items.map(
    ({ label, onClick, icon, closeMenuOnClick = true }) =>
      ({ active, close }) =>
        (
          <Button
            variant="none"
            onClick={(event) => {
              event.preventDefault();
              onClick();
              if (closeMenuOnClick) close();
            }}
            className={twMerge(
              active ? "bg-gray-100" : "",
              "text-start px-4 py-3 text-sm text-gray-700 w-full rounded-none flex items-center gap-x-4 active:bg-gray-200"
            )}
          >
            {icon} {label}
          </Button>
        )
  ) as GenericMenuItem[];

  return <GenericMenu items={_items} {...rest} />;
}
