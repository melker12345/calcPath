"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/** True after client hydration — avoids setState-in-effect for mounted gates. */
export function useClientMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}