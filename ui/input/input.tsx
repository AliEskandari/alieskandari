import { twMerge } from "@/modules/functions/css";
import { waitUntil } from "@/modules/functions/time";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { MotionProps, motion } from "framer-motion";
import { debounce } from "lodash";
import {
  ChangeEvent,
  ChangeEventHandler,
  InputHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { ZodIssue } from "zod";
import Button from "../buttons/button";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>, // Exclude conflicting HTML input element props
  keyof MotionProps // from Framer Motion's MotionProps interface
> & // and add Framer Motion's animation props
  MotionProps & {
    // add custom props
    error?: ZodIssue | string;
    onChangeDebounced?: ChangeEventHandler<HTMLInputElement>;
    onClickClear?: () => void;
    debounceTimeout?: number;
    containerRef?: React.MutableRefObject<HTMLDivElement | null>;
    showClearButton?: boolean;
    scrollIntoView?: boolean;
  };

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      children,
      error,
      onChange,
      onChangeDebounced,
      onClickClear,
      debounceTimeout,
      containerRef,
      showClearButton = true,
      scrollIntoView = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const _ref = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => _ref.current!);

    useEffect(() => {
      if (error && scrollIntoView && _ref.current) {
        waitUntil(
          () => {
            return (
              _ref.current!.style.visibility === "visible" ||
              _ref.current!.style.visibility === ""
            );
          },
          () => {
            setTimeout(() => {
              const topPosition =
                _ref.current!.getBoundingClientRect().top + window.pageYOffset;
              const offset = -120; // pixels
              window.scrollTo({
                top: topPosition + offset,
                behavior: "smooth",
              });
            }, 400);
          }
        );
      }
    }, [error, _ref.current]);

    const handleChangeDebounced = useCallback(
      debounce(async (event: ChangeEvent<HTMLInputElement>) => {
        if (onChangeDebounced) onChangeDebounced(event);
      }, debounceTimeout ?? 500),
      []
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(event);
      // if (event.target.value === "") onChangeDebounced?.(event);
      // if (onChangeDebounced) handleChangeDebounced(event);
    };

    const handleClickClear = () => {
      if (_ref.current) {
        if (onClickClear) onClickClear();
        else _ref.current.value = "";
        _ref.current.focus();
      }
    };

    return (
      <div className="relative group w-full" ref={containerRef}>
        <motion.input
          {...props}
          onChange={handleChange}
          ref={ref ?? _ref}
          variants={{
            open: { transitionEnd: { visibility: "visible" } },
            closed: { visibility: "hidden" },
          }}
          className={twMerge(
            "bg-gray-100 hover:bg-gray-200 hover:border-gray-200 focus:bg-gray-100 rounded-lg block w-full transition-colors disabled:cursor-pointer border-gray-100 border-2 focus:border-orange-500 group-focus:border-orange-500 group-active:border-orange-500 focus:ring-0 focus:border-2 px-3 py-2 pr-10 focus:outline-none peer text-gray-900 placeholder:text-gray-500",
            className,
            error
              ? "bg-red-100 focus:ring-red-500 hover:bg-red-200 border-red-100 hover:border-red-200"
              : null,
            disabled ? "text-gray-500 hover:bg-gray-100" : null
          )}
          disabled={disabled}
        />
        {showClearButton ? (
          <Button
            className={twMerge(
              "absolute right-1.5 p-1 top-0 h-full hidden peer-focus:block group-focus:block active:block text-gray-400 hover:text-gray-500",
              _ref.current?.value === "" ? "!hidden" : ""
            )}
            onClick={handleClickClear}
          >
            <XCircleIcon className=" w-6" />
          </Button>
        ) : null}
      </div>
    );
  }
);

export default Input;
