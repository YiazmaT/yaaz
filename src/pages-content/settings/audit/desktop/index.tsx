"use client";
import {Box} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {AuditLog} from "../types";
import {AuditFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";
import {API_ROUTE} from "../use-audit";
import {getActionLabel, getModuleLabel} from "../utils";

export function DesktopView(props: DesktopViewProps) {
  const {audit} = props;
  const {translate} = useTranslate();

  const filters = audit.appliedFilters;
  const title =
    filters?.module && filters?.action_type
      ? `${translate("audit.title")} (${translate(getModuleLabel(filters.module))} | ${translate(getActionLabel(filters.module, filters.action_type))})`
      : translate("audit.title");

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{px: "30px", pt: "8px", pb: "16px"}}>
          <AuditFiltersComponent onApply={audit.handleApply} onClear={audit.handleClear} />
        </Box>

        {audit.showResults && (
          <Box sx={{flex: 1, minHeight: 0}}>
            <ScreenCard title={title}>
              <DataTable<AuditLog>
                apiRoute={API_ROUTE}
                columns={audit.generateConfig()}
                filters={audit.buildFilters()}
                defaultRowsPerPage={25}
                hideSearch
              />
            </ScreenCard>
          </Box>
        )}
      </Box>
    </>
  );
}
