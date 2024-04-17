import { useBreadcrumbStore } from "@/state";
import { isEqual } from "lodash";
import { useEffect, useRef } from "react";

type BreadcrumbsMap = {
  [key: string]: string | undefined;
};
export function useBreadcrumbs(crumbs: BreadcrumbsMap, deps: any[] = []) {
  const { setCrumb } = useBreadcrumbStore();
  const previousCrumbs = useRef<BreadcrumbsMap>({});

  useEffect(() => {
    if (isEqual(previousCrumbs.current, crumbs)) return;
    previousCrumbs.current = crumbs;
    Object.entries(crumbs).forEach(([key, value]) => {
      setCrumb(key, value);
    });
  }, deps);
}
