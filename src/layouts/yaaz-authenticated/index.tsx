"use client";
import {PropsWithChildren} from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import {useYaazAuthenticatedLayout} from "./use-yaaz-authenticated-layout";
import {DesktopView} from "./desktop-view";
import {MobileView} from "./mobile-view";

export function YaazAuthenticatedLayout(props: PropsWithChildren) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const layout = useYaazAuthenticatedLayout();

  if (isMobile) {
    return <MobileView layout={layout}>{props.children}</MobileView>;
  }

  return <DesktopView layout={layout}>{props.children}</DesktopView>;
}
