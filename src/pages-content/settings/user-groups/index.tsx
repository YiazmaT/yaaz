"use client";
import {useMediaQuery, useTheme} from "@mui/material";
import {DesktopView} from "./desktop";
import {MobileView} from "./mobile";
import {useUserGroups} from "./use-user-groups";

export function UserGroupsScreen() {
  const theme = useTheme();
  const userGroups = useUserGroups();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return <MobileView userGroups={userGroups} />;
  }

  return <DesktopView userGroups={userGroups} />;
}
