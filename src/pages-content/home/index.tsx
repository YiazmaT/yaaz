"use client";
import {Box, Typography} from "@mui/material";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";

export function HomeScreen() {
  const {translate} = useTranslate();
  const {user} = useTenant();

  return (
    <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
      <Typography variant="h5" color="text.secondary">
        {translate("home.welcome")}, {user?.name}
      </Typography>
    </Box>
  );
}
