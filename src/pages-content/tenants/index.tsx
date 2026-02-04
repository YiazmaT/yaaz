"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {useTenants} from "./use-tenants";
import {MobileView} from "./mobile";

export function TenantsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const tenants = useTenants();

  if (isMobile) {
    return <MobileView tenants={tenants} />;
  }

  return <DesktopView tenants={tenants} />;
}
