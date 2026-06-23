import { useEffect, useState } from "react";
import { getBreakpoint, useBreakpoint } from "@zvoove/unity-ui";

const SIDEBAR_OPEN_STORAGE_KEY = "shell:sidebar-open";

function getStoredSidebarOpen(): boolean {
  if (typeof localStorage === "undefined") {
    return true;
  }

  const saved = localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
  return saved === null || saved === "true";
}

function isMobileViewport(width: number): boolean {
  const breakpoint = getBreakpoint(width);
  return breakpoint === "minimum" || breakpoint === "mobile";
}

function getInitialSidebarOpen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return isMobileViewport(window.innerWidth) ? false : getStoredSidebarOpen();
}

export function useSidebarOpen() {
  const { isSmallerThan } = useBreakpoint();
  const isMobile = isSmallerThan("tablet");
  const [open, setOpen] = useState(getInitialSidebarOpen);

  useEffect(() => {
    setOpen(isMobile ? false : getStoredSidebarOpen());
  }, [isMobile]);

  const setSidebarOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!isMobile) {
      localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(nextOpen));
    }
  };

  return [open, setSidebarOpen] as const;
}
