"use client";
import {ReactNode} from "react";
import {Box, CardContent, Typography} from "@mui/material";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {UserInfo} from "@/src/components/user-info";
import {AuditLog} from "../types";
import {AuditFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import {API_ROUTE} from "../use-audit";
import {getActionLabel, getModuleLabel} from "../utils";

export function MobileView(props: MobileViewProps) {
  const {audit} = props;
  const {translate} = useTranslate();

  const filters = audit.appliedFilters;
  const title =
    filters?.module && filters?.action_type
      ? `${translate("audit.title")} (${translate(getModuleLabel(filters.module))} | ${translate(getActionLabel(filters.module, filters.action_type))})`
      : translate("audit.title");

  function renderRow(item: AuditLog, _actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{...flexGenerator("c"), gap: 0.5}}>
          <UserInfo user={item.user} imageSize={36} />
          <Box sx={{...flexGenerator("r.center"), gap: 1}}>
            <Typography variant="caption" color="text.secondary">
              {translate("audit.fields.module")}:
            </Typography>
            <Typography variant="body2">{translate(getModuleLabel(item.module))}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{fontFamily: "monospace", fontSize: "0.7rem", wordBreak: "break-all"}}>
            {item.route ?? "-"}
          </Typography>
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <Box sx={{p: 2, pb: 1}}>
        <AuditFiltersComponent onApply={audit.handleApply} onClear={audit.handleClear} />
      </Box>

      {audit.showResults && (
        <Box sx={{flex: 1, minHeight: 0}}>
          <MobileList<AuditLog>
            title={title}
            apiRoute={API_ROUTE}
            renderRow={renderRow}
            filters={audit.buildFilters()}
            defaultRowsPerPage={25}
            hideSearch
          />
        </Box>
      )}
    </Box>
  );
}
