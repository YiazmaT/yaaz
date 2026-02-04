"use client";
import {Box} from "@mui/material";
import {ReportSelector} from "../components/report-selector";
import {ReportType} from "../types";
import {SalesSummaryReport} from "../report-types/sales-summary/sales-summary-report";
import {StockLevelsReport} from "../report-types/stock-levels/stock-levels-report";
import {ProfitMarginReport} from "../report-types/profit-margin/profit-margin-report";
import {MobileViewProps} from "./types";

export function MobileView(props: MobileViewProps) {
  const {reports} = props;

  function renderReport() {
    switch (reports.selectedReport) {
      case ReportType.SALES_SUMMARY:
        return <SalesSummaryReport />;
      case ReportType.STOCK_LEVELS:
        return <StockLevelsReport />;
      case ReportType.PROFIT_MARGIN:
        return <ProfitMarginReport />;
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
