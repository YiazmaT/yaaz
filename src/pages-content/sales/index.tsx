"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";
import {useSales} from "./use-sales";

export function SalesScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const sales = useSales();

  if (isMobile) {
    return <MobileView sales={sales} />;
  }

  return <DesktopView sales={sales} />;
}
