import { EffectCallback, useEffect } from "react";

/**
 * React lifecycle hook that runs an effect only once.
 *
 * @remarks
 * This hook is useful when you want to run an effect only once when the component mounts.
 * It is equivalent to `useEffect` with an empty dependency array.
 *
 * @param effect - The effect function to run.
 *
 * @example
 * ```jsx
 * import {useEffectOnce} from 'react-use';
 *
 * const Demo = () => {
 *   useEffectOnce(() => {
 *     console.log('Running effect once on mount')
 *
 *     return () => {
 *       console.log('Running clean-up of effect on unmount')
 *     }
 *   });
 *
 *   return null;
 * };
 * ```
 *
 * @see {@link https://reactjs.org/docs/hooks-effect.html|React useEffect}
 *
 * @public
 */

export const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};
