import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { isEmpty, isEqual } from "lodash";
import React, {
  ChangeEvent,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { ZodIssue } from "zod";
import Button from "@/components/button/button";

import { iff } from "@/modules/functions/shortcuts/iff";
import { waitUntil } from "@/modules/functions/time";
import { Float } from "@headlessui-float/react";
import { Listbox } from "@headlessui/react";

export namespace Dropdown {
  export type Option = { [key: string]: any } | string;
  export type NameValueOption<T> = { name: string; value: T };
}

export type DropdownError = {
  message: string;
};

type DropdownProps<D = string> = {
  options?: readonly D[];
  accessor?: string;
  valueAccessor?: string;
  onClickOption?: (option: D) => void;
  initialOption?: D | ((option: D) => boolean);
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: ZodIssue | string;
  disabled?: boolean;
  classNames?: {
    button?: string;
    listDropdown?: string;
    option?: string;
  };
  className?: string;
  emptyState?: ReactNode;
  name?: string;
};

export default function Dropdown<D extends Dropdown.Option>({
  options,
  emptyState,
  onClickOption = () => {},
  initialOption,
  onChange,
  accessor = "name",
  valueAccessor = "value",
  error,
  classNames,
  className,
  disabled = false,
  name,
}: DropdownProps<D>) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<D | null>(() => {
    if (!initialOption) return null;
    else if (typeof initialOption == "function") {
      return options?.find((option) => initialOption(option)) || null;
    } else return initialOption;
  });

  const _emptyState = emptyState || (
    <>
      <h5 className="text-center text-gray-400">No options available</h5>
    </>
  );

  const scrollToDropdown = useCallback(() => {
    if (dropdownRef.current) {
      const topPosition =
        dropdownRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offset = -120; // pixels
      window.scrollTo({
        top: topPosition + offset,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (error && dropdownRef.current) {
      // @ts-ignore - meta is not defined in style
      if (!dropdownRef.current.style.meta?.motion) scrollToDropdown();

      waitUntil(
        // @ts-ignore - meta is not defined in style
        () => dropdownRef.current?.style.meta?.motion.variant === "open",
        () => setTimeout(scrollToDropdown, 400)
      );
    }
  }, [error]);

  const handleClickOption = (option: D) => {
    setSelectedOption(option);
    onClickOption(option);
    onChange?.({
      target: {
        type: "text",
        name,
        value: typeof option == "string" ? option : option[valueAccessor],
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <Listbox
      ref={dropdownRef}
      value={selectedOption}
      onChange={handleClickOption}
      disabled={disabled}
      as={"div"}
      className={twMerge("relative inline-block text-start", className)}
    >
      <Float
        as="div"
        offset={10}
        flip
        zIndex={5}
        placement="bottom-start"
        className="relative w-full"
        floatingAs={Fragment}
      >
        <Listbox.Button
          className={twMerge(
            "gap-x-2 flex items-center justify-between rounded-md bg-gray-100 py-2 px-3 hover:bg-gray-200 text-gray-500 w-full",
            classNames?.button,
            error ? "bg-red-100 hover:bg-red-200" : null
          )}
        >
          <h5 className="whitespace-nowrap overflow-x-hidden text-ellipsis w-11/12 text-start">
            {(typeof selectedOption == "string"
              ? selectedOption
              : selectedOption?.[accessor]) ?? "Select"}
          </h5>
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Listbox.Button>
        <Listbox.Options
          className={twMerge(
            "overflow-y-auto absolute right-0 z-10 w-full  origin-top-left rounded-md bg-white ring-1 ring-black ring-opacity-5 ring-inset focus:outline-none sm:origin-bottom-right flex pt-2 pb-2 px-2 flex-col gap-y-2 max-h-64",
            classNames?.listDropdown
          )}
        >
          {iff(
            isEmpty(options),
            _emptyState,
            options?.map((option) => {
              const label =
                typeof option == "string" ? option : option[accessor];
              return (
                <Listbox.Option
                  as={Button}
                  variant="none"
                  key={label}
                  value={option}
                  className={twMerge(
                    "block px-3 py-3 w-full text-left hover:bg-gray-100",
                    classNames?.option,
                    iff(
                      isEqual(selectedOption, option),
                      "bg-gray-100 text-gray-900"
                    )
                  )}
                >
                  {label}
                </Listbox.Option>
              );
            })
          )}
        </Listbox.Options>
      </Float>
    </Listbox>
  );
}
