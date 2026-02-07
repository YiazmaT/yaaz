"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {useClients} from "./use-clients";
import {MobileView} from "./mobile";

export function ClientsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const clients = useClients();

  if (isMobile) {
    return <MobileView clients={clients} />;
  }

  return <DesktopView clients={clients} />;
}
