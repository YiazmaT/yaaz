"use client";
import {Box} from "@mui/material";
import {ReportSelector} from "../components/report-selector";
import {ReportType} from "../types";
import {SalesSummaryReport} from "../report-types/sales-summary/sales-summary-report";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {reports} = props;

  function renderReport() {
    switch (reports.selectedReport) {
      case ReportType.SALES_SUMMARY:
        return <SalesSummaryReport />;
      default:
        return null;
    }
  }

  return (
    <Box sx={{p: "30px", height: "100%", overflow: "auto"}}>
      <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
        <ReportSelector reports={reports} />
        {renderReport()}
      </Box>
    </Box>
  );
}
