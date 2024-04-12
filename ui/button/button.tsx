import React from "react";
import { MotionProps, motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof MotionProps
> &
  MotionProps & {
    variant?: keyof typeof variants;
    isLoading?: boolean;
    loadingText?: string;
    as?: "Link";
    href?: string;
    selected?: boolean; // Add the selected property
  };

const variants = {
  primary:
    "bg-orange-100 text-orange-500 hover:bg-orange-200 active:bg-orange-300",
  secondary: "bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300",
  secondaryDark:
    "hover:bg-gray-500 active:bg-gray-300 hover:text-white border-red-100 ",
  red: "bg-red-100 text-red-500 hover:bg-red-200 active:bg-red-300",
  dark: "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700",
  outline: "text-orange-500 hover:text-orange-400 active:text-orange-300",
  "outline-dark": "text-black hover:text-neutral-800 active:text-neutral-700",
  none: "p-0",
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant,
      isLoading,
      loadingText,
      as,
      href,
      selected, // Get the selected property from props
      ...props
    },
    ref
  ) => {
    const _props = {
      className: twMerge(
        "transition-colors outline-none focus:outline-none rounded-lg disabled:cursor-pointer py-3 px-5",
        variants[variant ?? "none"],
        className,
        isLoading && variants.secondary,
        props.disabled && variants.secondary,
        props.hidden && "hidden",
        selected && "dark:bg-gray-800 text-gray-100" // Apply dark style when selected is true
      ),
      disabled: isLoading,
    };
    if (as == "Link") {
      return (
        <a href={href ?? ""} {..._props}>
          {children as ReactNode}
        </a>
      );
    }

    return (
      <motion.button ref={ref} type="button" {..._props} {...props}>
        {isLoading && loadingText ? loadingText : children}
      </motion.button>
    );
  }
);

export default Button;
