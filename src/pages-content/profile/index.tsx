"use client";
import {Avatar, Box, Button, Chip, IconButton, Typography, useTheme} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {useState} from "react";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {PasswordRulesDrawer} from "@/src/pages-content/profile/components/password-rules-drawer";
import {EditProfileDrawer} from "@/src/pages-content/profile/components/edit-profile-drawer";

export function ProfileScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const {user} = useTenant();
  const {translate} = useTranslate();
  const theme = useTheme();

  const roleLabel = user?.owner ? translate("profile.roles.owner") : user?.admin ? translate("profile.roles.admin") : translate("profile.roles.user");

  return (
    <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%", p: 3}}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          backgroundColor: "white",
          borderRadius: 3,
          border: "1px solid transparent",
          backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: `0px 8px 32px rgba(0,0,0,0.1)`,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setEditOpen(true)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            border: "1px solid transparent",
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.divider}, ${theme.palette.divider})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            "&:hover": {
              backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <EditOutlinedIcon sx={{fontSize: 18}} />
        </IconButton>
        <Avatar
          src={user?.image ?? undefined}
          alt={user?.name}
          sx={{
            width: 200,
            height: 200,
            fontSize: 48,
            bgcolor: theme.palette.primary.main,
            border: `3px solid ${theme.palette.primary.main}`,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{textAlign: "center"}}>
          <Typography variant="h5" fontWeight={700}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
            {user?.login}
          </Typography>
        </Box>

        <Chip
          label={roleLabel}
          size="small"
          sx={{
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            fontWeight: 600,
            fontSize: 12,
          }}
        />

        <Button
          variant="outlined"
          startIcon={<LockOutlinedIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            mt: 1,
            border: "1px solid transparent",
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            },
          }}
        >
          {translate("profile.changePassword")}
        </Button>
      </Box>

      <PasswordRulesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <EditProfileDrawer open={editOpen} onClose={() => setEditOpen(false)} />
    </Box>
  );
}
