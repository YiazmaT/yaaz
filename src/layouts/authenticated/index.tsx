"use client";
import {PropsWithChildren} from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import {useAuthenticatedLayout} from "./use-authenticated-layout";
import {DesktopView} from "./desktop-view";
import {MobileView} from "./mobile-view";

export function AuthenticatedLayout(props: PropsWithChildren) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const layout = useAuthenticatedLayout();

  if (isMobile) {
    return <MobileView layout={layout}>{props.children}</MobileView>;
  }

  return <DesktopView layout={layout}>{props.children}</DesktopView>;
}
