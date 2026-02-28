"use client";
import {Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Typography, useTheme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {useEffect, useState} from "react";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant, useYaazUser} from "@/src/contexts/tenant-context";
import {useAuth} from "@/src/contexts/auth-context";
import {useNavigate} from "@/src/hooks/use-navigate";
import {SearchModal} from "./search-modal";
import {TopBarProps} from "./types";

export function TopBar({menuItems}: TopBarProps) {
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const {user} = useTenant();
  const {logout} = useAuth();
  const {yaazUser} = useYaazUser();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();
  const displayUser = user ?? yaazUser;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 0.75,
          borderRadius: "5px",
          backgroundColor: "white",
          border: "1px solid transparent",
          backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.divider}, ${theme.palette.divider})`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.07)",
        }}
      >
        <Box
          onClick={() => setOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            userSelect: "none",
            py: 0.5,
            px: 0.5,
            borderRadius: "999px",
            transition: "opacity 0.2s",
            "&:hover": {opacity: 0.7},
          }}
        >
          <SearchIcon sx={{fontSize: 18, color: "text.secondary", flexShrink: 0}} />
          <Typography variant="body2" color="text.secondary">
            {translate("navSearch.hint")}
          </Typography>
        </Box>

        <Avatar
          src={displayUser?.image ?? undefined}
          alt={displayUser?.name}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            width: 32,
            height: 32,
            fontSize: 14,
            bgcolor: displayUser?.image || displayUser?.name ? theme.palette.primary.main : "lightgrey",
            flexShrink: 0,
            cursor: "pointer",
            transition: "opacity 0.2s",
            "&:hover": {opacity: 0.8},
          }}
        >
          {displayUser?.name?.[0]?.toUpperCase() ?? <AccountCircleOutlinedIcon sx={{fontSize: 20, color: "grey.600"}} />}
        </Avatar>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{vertical: "bottom", horizontal: "right"}}
        transformOrigin={{vertical: "top", horizontal: "right"}}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              mt: 0.5,
              overflow: "hidden",
              border: "1px solid transparent",
              backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow: `0px 8px 24px rgba(0,0,0,0.12)`,
            },
          },
        }}
      >
        <Box sx={{px: 2, py: 1, display: "flex", alignItems: "center", gap: 1.5}}>
          <Avatar
            src={displayUser?.image ?? undefined}
            alt={displayUser?.name}
            sx={{
              width: 36,
              height: 36,
              fontSize: 15,
              bgcolor: displayUser?.image || displayUser?.name ? theme.palette.primary.main : "lightgrey",
              flexShrink: 0,
            }}
          >
            {displayUser?.name?.[0]?.toUpperCase() ?? <AccountCircleOutlinedIcon sx={{fontSize: 22, color: "grey.600"}} />}
          </Avatar>
          <Typography variant="body2" fontWeight={600} noWrap sx={{maxWidth: 160}}>
            {displayUser?.name}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{py: 0.5}}>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              navigate("/profile");
            }}
            sx={{gap: 1.5, mx: 0, borderRadius: 0, "&:hover": {backgroundColor: `${theme.palette.primary.main}11`}}}
          >
            <ListItemIcon sx={{minWidth: "auto", color: theme.palette.primary.main}}>
              <AccountCircleOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{translate("topBar.myProfile")}</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              logout();
            }}
            sx={{gap: 1.5, mx: 0, borderRadius: 0, "&:hover": {backgroundColor: `${theme.palette.primary.main}11`}}}
          >
            <ListItemIcon sx={{minWidth: "auto", color: theme.palette.primary.main}}>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{translate("topBar.logout")}</Typography>
          </MenuItem>
        </Box>
      </Menu>

      <SearchModal open={open} onClose={() => setOpen(false)} menuItems={menuItems} />
    </>
  );
}
