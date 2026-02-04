import {useState} from "react";
import {ReportTab, ReportType} from "./types";

export function useReports() {
  const [selectedTab, setSelectedTab] = useState<ReportTab>(ReportTab.SALES);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  function handleTabChange(tab: ReportTab) {
    setSelectedTab(tab);
    setSelectedReport(null);
  }

  function handleReportChange(reportType: ReportType | null) {
    setSelectedReport(reportType);
  }

  return {
    selectedTab,
    selectedReport,
    handleTabChange,
    handleReportChange,
  };
}

export type UseReportsReturn = ReturnType<typeof useReports>;
