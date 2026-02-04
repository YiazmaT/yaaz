"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {usePackages} from "./use-packages";
import {MobileView} from "./mobile";

export function PackagesScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const packages = usePackages();

  if (isMobile) {
    return <MobileView packages={packages} />;
  }

  return <DesktopView packages={packages} />;
}
