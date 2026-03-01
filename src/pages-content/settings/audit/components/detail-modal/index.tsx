"use client";
import {Box, Chip, Divider, Typography} from "@mui/material";
import {GenericModal} from "@/src/components/generic-modal";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatDate} from "@/src/utils/format-date";
import {getActionTypeColor, getActionTypeLabelKey, getModuleLabelKey} from "../../constants";
import {DetailModalProps} from "./types";
import {UserInfo} from "@/src/components/user-info";

export function AuditDetailModal(props: DetailModalProps) {
  const {translate} = useTranslate();
  const log = props.log;
  const hasBeforeAfter = log?.content && "before" in log.content && "after" in log.content;

  function renderJson(value: Record<string, any> | null) {
    if (!value)
      return (
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      );
    return (
      <Box
        component="pre"
        sx={{
          margin: 0,
          padding: 1.5,
          backgroundColor: "grey.100",
          borderRadius: 1,
          fontSize: "0.75rem",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontFamily: "monospace",
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    );
  }

  return (
    <GenericModal open={!!log} onClose={props.onClose} title="audit.details.title" maxWidth="md">
      {log && (
        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
          <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5}}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {translate("audit.fields.date")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(log.create_date, true)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {translate("audit.fields.user")}
              </Typography>
              <UserInfo user={log.user} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {translate("audit.fields.module")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {translate(getModuleLabelKey(log.module))}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {translate("audit.fields.action")}
              </Typography>
              <Box sx={{marginTop: 0.25}}>
                <Chip label={translate(getActionTypeLabelKey(log.action_type))} color={getActionTypeColor(log.action_type)} size="small" />
              </Box>
            </Box>
            <Box sx={{gridColumn: "1 / -1"}}>
              <Typography variant="caption" color="text.secondary">
                {translate("audit.fields.route")}
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{fontFamily: "monospace", fontSize: "0.8rem"}}>
                {log.route ?? "-"}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{marginBottom: 1}}>
              {translate("audit.fields.content")}
            </Typography>
            {hasBeforeAfter ? (
              <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{display: "block", marginBottom: 0.5}}>
                    {translate("audit.fields.before")}
                  </Typography>
                  {renderJson((log.content as any).before)}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{display: "block", marginBottom: 0.5}}>
                    {translate("audit.fields.after")}
                  </Typography>
                  {renderJson((log.content as any).after)}
                </Box>
              </Box>
            ) : (
              renderJson(log.content)
            )}
          </Box>
        </Box>
      )}
    </GenericModal>
  );
}
