"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";
import {useUsers} from "./use-users";

export function UsersScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const users = useUsers();

  if (isMobile) {
    return <MobileView users={users} />;
  }

  return <DesktopView users={users} />;
}
