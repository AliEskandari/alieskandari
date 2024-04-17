import { useDependencyEffect } from "./use-dependency-effect";
import { useEffectOnce } from "./use-effect-once";
import { useMount } from "./use-mount";
import { useUnmount } from "./use-unmount";

const lifecycle = {
  useDependencyEffect,
  useEffectOnce,
  useMount,
  useUnmount,
};

export default lifecycle;
