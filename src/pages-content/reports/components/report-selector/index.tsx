"use client";
import {Box, Card, CardContent, Tab, Tabs, Typography} from "@mui/material";
import {Dropdown} from "@/src/components/form-fields/dropdown";
import {useTranslate} from "@/src/contexts/translation-context";
import {useReportsConstants} from "../../constants";
import {ReportOption, ReportTab} from "../../types";
import {ReportSelectorProps} from "./types";

export function ReportSelector(props: ReportSelectorProps) {
  const {reports} = props;
  const {translate} = useTranslate();
  const {salesReportOptions} = useReportsConstants();

  function getCurrentOptions(): ReportOption[] {
    return salesReportOptions;
  }

  function handleTabChange(_: React.SyntheticEvent, newValue: ReportTab) {
    reports.handleTabChange(newValue);
  }

  function handleChange(option: ReportOption | null) {
    reports.handleReportChange(option?.value ?? null);
  }

  function getSelectedOption(): ReportOption | null {
    if (!reports.selectedReport) return null;
    const options = getCurrentOptions();
    return options.find((opt) => opt.value === reports.selectedReport) || null;
  }

  return (
    <Card
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent sx={{p: 3}}>
        <Typography variant="h5" sx={{fontWeight: 600, mb: 3}}>
          {translate("reports.title")}
        </Typography>

        <Tabs value={reports.selectedTab} onChange={handleTabChange} sx={{mb: 3}}>
          <Tab label={translate("reports.tabs.sales")} value={ReportTab.SALES} />
        </Tabs>

        <Box sx={{maxWidth: 400}}>
          <Dropdown<ReportOption>
            label="reports.selectReport"
            options={getCurrentOptions()}
            uniqueKey="value"
            buildLabel={(opt) => opt.label}
            value={getSelectedOption()}
            onChange={handleChange}
          />
        </Box>

        {reports.selectedReport && (
          <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
            {getCurrentOptions().find((opt) => opt.value === reports.selectedReport)?.description || ""}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
