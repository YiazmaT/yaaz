"use client";
import {PropsWithChildren, useMemo} from "react";
import {GlobalStyles, ThemeProvider} from "@mui/material";
import {useTenant} from "@/src/contexts/tenant-context";
import {createGlobalStyles, createTenantTheme, getDefaultColors} from "@/src/theme";

export function TenantThemeProvider(props: PropsWithChildren) {
  const {tenant} = useTenant();
  const defaults = getDefaultColors();

  const primary = tenant?.primary_color || defaults.primary;
  const secondary = tenant?.secondary_color || defaults.secondary;

  const theme = useMemo(() => createTenantTheme(primary, secondary), [primary, secondary]);
  const styles = useMemo(() => createGlobalStyles(primary), [primary]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={styles} />
      {props.children}
    </ThemeProvider>
  );
}
