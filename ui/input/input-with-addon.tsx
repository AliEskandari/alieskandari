import React, { forwardRef } from "react";
import Input from "./input";
import { twMerge } from "@/modules/functions/css";

type InputWithAddonProps = {
  leadingAddon?: React.ReactNode;
  trailingAddon?: React.ReactNode;
  classNames?: {
    container?: string;
    input?: string;
  };
} & React.ComponentProps<typeof Input>;

const InputWithAddon = forwardRef<HTMLInputElement, InputWithAddonProps>(
  ({ leadingAddon, trailingAddon, classNames, className, ...rest }, ref) => {
    return (
      <div className={twMerge("relative", classNames?.container)}>
        <Input
          {...rest}
          type="text"
          className={twMerge(
            leadingAddon ? "pl-7" : "",
            className,
            classNames?.input,
            "w-full"
          )}
        />

        <div className="pointer-events-none cursor-pointer absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-400 select-none items-center">
            {leadingAddon}
          </span>
        </div>

        {trailingAddon}
      </div>
    );
  }
);

export default InputWithAddon;
