"use client";
import {Avatar, Box, Typography, useTheme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useEffect, useState} from "react";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {SearchModal} from "./search-modal";
import {TopBarProps} from "./types";

export function TopBar({menuItems}: TopBarProps) {
  const [open, setOpen] = useState(false);
  const {user} = useTenant();
  const {translate} = useTranslate();
  const theme = useTheme();

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
          src={user?.image ?? undefined}
          alt={user?.name}
          sx={{
            width: 32,
            height: 32,
            fontSize: 14,
            bgcolor: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>

      <SearchModal open={open} onClose={() => setOpen(false)} menuItems={menuItems} />
    </>
  );
}
