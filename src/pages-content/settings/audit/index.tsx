"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";
import {useAudit} from "./use-audit";

export function AuditScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const audit = useAudit();

  if (isMobile) {
    return <MobileView audit={audit} />;
  }

  return <DesktopView audit={audit} />;
}
