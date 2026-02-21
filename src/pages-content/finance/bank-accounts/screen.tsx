"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {BankAccountsDesktop} from "./desktop";
import {BankAccountsMobile} from "./mobile";

export function BankAccountsScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return <BankAccountsMobile />;

  return (
    <ScreenCard title="finance.banksTitle">
      <BankAccountsDesktop />
    </ScreenCard>
  );
}
