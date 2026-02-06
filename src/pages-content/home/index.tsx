"use client";
import {Box, Grid, Typography} from "@mui/material";
import {useTranslate} from "@/src/contexts/translation-context";
import {WelcomeCard} from "./components/welcome-card";
import {StockAlertsCard} from "./components/stock-alerts-card";
import {TodaySalesCard} from "./components/today-sales-card";
import {WeeklySalesCard} from "./components/weekly-sales-card";
import {MonthlySalesCard} from "./components/monthly-sales-card";
import {SemestralSalesCard} from "./components/semestral-sales-card";

export function HomeScreen() {
  const {translate} = useTranslate();

  return (
    <Box sx={{padding: {xs: 2, md: 3}}}>
      <Typography variant="h4" fontWeight={600} sx={{marginBottom: 3}}>
        {translate("dashboard.title")}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 3}}>
          <Box sx={{display: "flex", flexDirection: "column", gap: 3, height: "100%"}}>
            <WelcomeCard />
            <StockAlertsCard />
          </Box>
        </Grid>
        <Grid size={{xs: 12, md: 3}}>
          <TodaySalesCard />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <WeeklySalesCard />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <MonthlySalesCard />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <SemestralSalesCard />
        </Grid>
      </Grid>
    </Box>
  );
}
