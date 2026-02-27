"use client";
import {Box} from "@mui/material";
import {ReportSelector} from "../components/report-selector";
import {ReportType} from "../types";
import {SalesSummaryReport} from "../report-types/sales-summary/sales-summary-report";
import {MobileViewProps} from "./types";

export function MobileView(props: MobileViewProps) {
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
    <Box sx={{p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 2, overflow: "auto"}}>
      <ReportSelector reports={reports} />
      {renderReport()}
    </Box>
  );
}
