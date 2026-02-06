"use client";
import {Box, Card, CardContent, Typography} from "@mui/material";
import {useTenant} from "@/src/contexts/tenant-context";
import {useTranslate} from "@/src/contexts/translation-context";

export function WelcomeCard() {
  const {tenant, user} = useTenant();
  const {translate} = useTranslate();

  if (!tenant || !user) return null;

  return (
    <Card sx={{flex: 1, display: "flex", alignItems: "flex-start"}}>
      <CardContent sx={{display: "flex", alignItems: "center", gap: 2, width: "100%"}}>
        {tenant.logo && (
          <Box
            component="img"
            src={tenant.logo}
            alt={tenant.name}
            sx={{
              width: 64,
              height: 64,
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        )}
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {translate("dashboard.welcome")}, {user.name}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tenant.name}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
