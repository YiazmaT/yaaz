"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";

export function FinanceScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return <MobileView />;
  }

  return <DesktopView />;
}
