import { useEffect, useLayoutEffect } from "react";
import { isBrowser } from "@/modules/functions/browser/isBrowser";

export const useIsomorphicLayoutEffect = isBrowser
  ? useLayoutEffect
  : useEffect;
