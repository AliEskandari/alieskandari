import React, { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  checked: boolean;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function Checkbox({
  checked,
  onChange,
  className,
  ...props
}: Props) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={(event) => {
        onChange?.({
          target: {
            type: "checkbox",
            name: props.name,
            checked: !checked,
          },
        } as ChangeEvent<HTMLInputElement>);
      }}
      className="relative inline-flex items-center cursor-pointer"
    >
      <input
        {...props}
        type="checkbox"
        checked={checked}
        disabled={props.disabled}
        readOnly
        className="sr-only peer"
      />

      <div
        className={twMerge(
          "w-11 h-6 bg-orange-100 hover:bg-orange-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 peer-disabled:bg-gray-200  peer-disabled:border-gray-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500 hover:peer-checked:bg-orange-600 transition-colors",
          className?.replace("checked", "peer-checked")
        )}
      ></div>
    </button>
  );
}
