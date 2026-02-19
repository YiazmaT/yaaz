"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {BillsDesktop} from ".";
import {BillsMobile} from "./mobile";

export function BillsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return <BillsMobile />;

  return (
    <ScreenCard title="finance.billsToPayTitle">
      <BillsDesktop />
    </ScreenCard>
  );
}
