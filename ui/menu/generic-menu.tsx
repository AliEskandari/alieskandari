import { Menu, MenuItemProps, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import { twMerge } from "@/modules/functions/css";
import ButtonComponent, { ButtonProps } from "../buttons/button";
import { Float } from "@headlessui-float/react";
export type GenericMenuItem = MenuItemProps<"button" | "div" | "a">["children"];
import { size } from "@floating-ui/react-dom";
import { flushSync } from "react-dom";
export type GenericMenuProps = {
  button: ReactNode;
  items: GenericMenuItem[];
  className?: string;
  classNames?: {
    Menu: {
      Items: string;
    };
  };
  autoPlacement?: boolean;
};

export default function GenericMenu({
  button,
  items,
  className,
  classNames,
  autoPlacement = true,
}: GenericMenuProps) {
  const [maxHeight, setMaxHeight] = useState<number>(80);
  const middleware = [
    size({
      apply({ availableHeight }) {
        flushSync(() => setMaxHeight(availableHeight));
      },
    }),
  ];
  return (
    <div className={className}>
      <Menu as="div">
        <Float
          placement="bottom-end"
          offset={4}
          autoPlacement={
            autoPlacement
              ? {
                  allowedPlacements: ["bottom-end", "top-end", "left"],
                }
              : false
          }
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          zIndex={5}
          middleware={middleware}
        >
          <Menu.Button
            as={ButtonComponent}
            variant="outline-dark"
            className="text-sm p-1 flex items-center"
          >
            {button}
          </Menu.Button>

          <Menu.Items
            className={twMerge(
              "min-w-[12rem] rounded-lg bg-white py-1.5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col gap-y-3 overflow-y-auto",
              classNames?.Menu.Items
            )}
            style={{
              maxHeight,
            }}
          >
            {items.map((item, index) => (
              <Menu.Item key={index}>{item}</Menu.Item>
            ))}
          </Menu.Items>
        </Float>
      </Menu>
    </div>
  );
}
