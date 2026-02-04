import {useTranslate} from "@/src/contexts/translation-context";
import {ReportOption, ReportType} from "./types";

export function useReportsConstants() {
  const {translate} = useTranslate();

  const salesReportOptions: ReportOption[] = [
    {
      value: ReportType.SALES_SUMMARY,
      label: translate("reports.types.salesSummary"),
      description: translate("reports.descriptions.salesSummary"),
    },
    {
      value: ReportType.PROFIT_MARGIN,
      label: translate("reports.types.profitMargin"),
      description: translate("reports.descriptions.profitMargin"),
    },
  ];

  const stockReportOptions: ReportOption[] = [
    {
      value: ReportType.STOCK_LEVELS,
      label: translate("reports.types.stockLevels"),
      description: translate("reports.descriptions.stockLevels"),
    },
  ];

  const stockTypeOptions = [
    {value: "all", label: translate("reports.stockTypes.all")},
    {value: "ingredients", label: translate("reports.stockTypes.ingredients")},
    {value: "products", label: translate("reports.stockTypes.products")},
    {value: "packages", label: translate("reports.stockTypes.packages")},
  ];

  return {salesReportOptions, stockReportOptions, stockTypeOptions};
}
