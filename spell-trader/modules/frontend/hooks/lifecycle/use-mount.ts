import { useEffectOnce } from "./use-effect-once";

/**
 * React lifecycle hook that calls a function after the component is mounted.
 *
 * @remarks
 * This hook is used to execute a function when the component is mounted. It is similar to the `componentDidMount` lifecycle method in class components.
 *
 * @example
 * ```jsx
 * import { useMount } from 'react-use';
 *
 * const Demo = () => {
 *   useMount(() => alert('MOUNTED'));
 *   return null;
 * };
 * ```
 *
 * @param fn - The function to run when the component mounts.
 */
export const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn();
  });
};
