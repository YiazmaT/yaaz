"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {NfeDesktop} from "./desktop";
import {NfeMobile} from "./mobile";

export function NfeScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return <NfeMobile />;

  return (
    <ScreenCard title="finance.nfeTitle">
      <NfeDesktop />
    </ScreenCard>
  );
}
