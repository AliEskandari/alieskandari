import Input, { InputProps } from "./input";
import numeral from "numeral";
import { ChangeEvent, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = InputProps;

export default function CurrencyInput({
  className,
  value,
  onChange,
  ...rest
}: Props) {
  const [valueString, setValueString] = useState(() =>
    numeral(value).format("0.00")
  );
  return (
    <div className="relative">
      <Input
        type="number"
        className={twMerge(className, "w-full pl-7 pr-12")}
        value={valueString}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          const matches = value.match(/^\d*(\.\d{0,2})?/g);
          setValueString(matches ? matches[0] : "");
          onChange?.(event);
        }}
        onBlur={(event: ChangeEvent<HTMLInputElement>) => {
          setValueString(numeral(event.target.value).format("0.00"));
        }}
        placeholder="0.00"
        aria-describedby="price-currency"
        showClearButton={false}
        step={0.01}
        {...rest}
      />

      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 sm:text-sm">$</span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <span className="text-gray-500 sm:text-sm" id="price-currency">
          USD
        </span>
      </div>
    </div>
  );
}
