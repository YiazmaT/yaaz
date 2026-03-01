"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, IconButton, Tooltip, Typography} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatDate} from "@/src/utils/format-date";
import {flexGenerator} from "@/src/utils/flex-generator";
import {UserInfo} from "@/src/components/user-info";
import {getActionTypeColor, getActionTypeLabelKey, getModuleLabelKey} from "../constants";
import {AuditLog} from "../types";
import {AuditFiltersComponent} from "../components/filters";
import {AuditDetailModal} from "../components/detail-modal";
import {MobileViewProps} from "./types";
import {API_ROUTE} from "../use-audit";

export function MobileView(props: MobileViewProps) {
  const {audit} = props;
  const {translate} = useTranslate();

  function renderRow(item: AuditLog, _actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{...flexGenerator("r.center.space-between"), marginBottom: 1}}>
          <Typography variant="caption" color="text.secondary" sx={{fontFamily: "monospace"}}>
            {formatDate(item.create_date, true)}
          </Typography>
          <Chip label={translate(getActionTypeLabelKey(item.action_type))} color={getActionTypeColor(item.action_type)} size="small" />
        </Box>

        <Box sx={{...flexGenerator("c"), gap: 0.5}}>
          <UserInfo user={item.user} imageSize={36} />
          <Box sx={{...flexGenerator("r.center"), gap: 1}}>
            <Typography variant="caption" color="text.secondary">
              {translate("audit.fields.module")}:
            </Typography>
            <Typography variant="body2">{translate(getModuleLabelKey(item.module))}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{fontFamily: "monospace", fontSize: "0.7rem", wordBreak: "break-all"}}>
            {item.route ?? "-"}
          </Typography>
        </Box>

        <Box sx={{...flexGenerator("r.center.flex-end"), marginTop: 1, paddingTop: 1, borderTop: "1px solid", borderColor: "divider"}}>
          <Tooltip title={translate("global.actions.view")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                audit.handleViewDetail(item);
              }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
            title="audit.title"
            apiRoute={API_ROUTE}
            renderRow={renderRow}
            filters={audit.buildFilters()}
            defaultRowsPerPage={25}
            hideSearch
          />
        </Box>
      )}

      <AuditDetailModal log={audit.selectedLog} onClose={audit.handleCloseDetail} />
    </Box>
  );
}
