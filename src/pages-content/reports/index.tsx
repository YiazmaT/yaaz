"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";
import {useReports} from "./use-reports";

export function ReportsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const reports = useReports();

  if (isMobile) {
    return <MobileView reports={reports} />;
  }

  return <DesktopView reports={reports} />;
}
