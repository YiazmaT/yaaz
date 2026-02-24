"use client";
import {Box, Grid, Typography} from "@mui/material";
import {useTranslate} from "@/src/contexts/translation-context";
import {AlertsCard} from "./components/alerts-card";
import {TodaySalesCard} from "./components/today-sales-card";
import {WeeklySalesCard} from "./components/weekly-sales-card";
import {MonthlySalesCard} from "./components/monthly-sales-card";
import {SemestralSalesCard} from "./components/semestral-sales-card";

export function DashboardScreen() {
  const {translate} = useTranslate();

  return (
    <Box sx={{padding: {xs: 2, md: 3}}}>
      <Typography variant="h4" fontWeight={600} sx={{marginBottom: 3}}>
        {translate("dashboard.title")}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 3}}>
          <AlertsCard />
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
