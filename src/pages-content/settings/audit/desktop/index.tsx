"use client";
import {Box} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {AuditLog} from "../types";
import {AuditFiltersComponent} from "../components/filters";
import {AuditDetailModal} from "../components/detail-modal";
import {DesktopViewProps} from "./types";
import {API_ROUTE} from "../use-audit";

export function DesktopView(props: DesktopViewProps) {
  const {audit} = props;

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{px: "30px", pt: "8px", pb: "16px"}}>
          <AuditFiltersComponent onApply={audit.handleApply} onClear={audit.handleClear} />
        </Box>

        {audit.showResults && (
          <Box sx={{flex: 1, minHeight: 0}}>
            <ScreenCard title="audit.title">
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

      <AuditDetailModal log={audit.selectedLog} onClose={audit.handleCloseDetail} />
    </>
  );
}
