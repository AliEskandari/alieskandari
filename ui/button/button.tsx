import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import React, {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from "react";
export type ButtonProps = LinkProps | _ButtonProps;

export type _ButtonProps = {
  as?: "button" | undefined;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  CustomProps;

export type LinkProps = {
  as: "Link";
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  CustomProps;

type CustomProps = {
  variant?: keyof typeof variants;
  isLoading?: boolean;
  loadingText?: string;
  selected?: boolean; // Add the selected property
};

const variants = {
  primary: "bg-goldenrod text-white",
  secondary: "bg-offwhite text-goldenrod border border-lightgold",
  secondaryDark:
    "hover:bg-gray-500 active:bg-gray-300 hover:text-white border-red-100 ",
  dark: "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700",
  outline: "text-oxfordblue hover:text-gray-700",
  "outline-dark": "text-black hover:text-neutral-800 active:text-neutral-700",
  none: "p-0",
  disabled: "",
} as const;

export const Button: ForwardRefExoticComponent<
  PropsWithoutRef<ButtonProps> & RefAttributes<HTMLButtonElement>
> = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    className,
    variant,
    isLoading,
    selected,
    loadingText,
    ...elementProps
  } = props;

  const _className = twMerge(
    "transition-colors outline-none focus:outline-none rounded-sm disabled:cursor-pointer py-3 px-5",
    variants[variant ?? "none"],
    className,
    isLoading && variants.disabled,
    props.as !== "Link" && props.disabled && variants.secondary,
    props.hidden && "hidden",
    selected && "dark:bg-gray-800 text-gray-100" // Apply dark style when selected is true
  );

  if (elementProps.as == "Link") {
    const { href, as, ...rest } = elementProps;
    return <Link href={href ?? ""} {...rest} className={_className} />;
  } else {
    const { children, as, ...rest } = elementProps;
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={_className}
        disabled={isLoading}
      >
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
});

export default Button;
