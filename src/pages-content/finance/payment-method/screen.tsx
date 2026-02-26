"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {ScreenCard} from "@/src/components/screen-card";
import {PaymentMethodsDesktop} from "./desktop";
import {PaymentMethodsMobile} from "./mobile";

export function PaymentMethodScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return <PaymentMethodsMobile />;

  return (
    <ScreenCard title="finance.paymentMethodTitle">
      <PaymentMethodsDesktop />
    </ScreenCard>
  );
}
