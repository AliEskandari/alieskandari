import { useEffect } from "react";

/**
 * A hook that runs a function when a dependency changes. The dependency list is passed
 * into the function as arguments.
 *
 * @example
 * ```ts
 * const fn = (str1: string, str2: string) => console.log(str1, str2);
 * useDependencyEffect(fn, changeableString1, changeableString2);
 * // logs the strings when any change
 * ```
 *
 * @param fn The function to run when the dependency changes
 * @param args The list of dependencies
 */
export const useDependencyEffect = <T extends unknown[]>(
  fn: (...args: T) => void,
  ...args: T
) => {
  useEffect(() => {
    fn(...args);
  }, [...args]);
};
