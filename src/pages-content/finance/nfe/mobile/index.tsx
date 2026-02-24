"use client";
import {ReactNode} from "react";
import {Badge, Box, CardContent, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/utils/format-date";
import {Nfe} from "../types";
import {NfeModal} from "../components/nfe-modal";
import {NfeFileModal} from "../components/file-modal";
import {useNfe} from "../use-nfe";

export function NfeMobile() {
  const {translate} = useTranslate();
  const nfe = useNfe();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function renderRow(item: Nfe, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              #{item.code} {item.description}
            </Typography>
            {item.supplier && (
              <Typography variant="body2" color="text.secondary">
                {item.supplier}
              </Typography>
            )}
          </Box>
          <Box sx={{textAlign: "right"}}>
            <Typography variant="body1" fontWeight={600}>
              {formatCurrency(String(item.total_amount))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.date)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}`}}>
          <Tooltip title={translate("finance.nfe.fields.file")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                nfe.handleViewFile(item);
              }}
            >
              <Badge badgeContent={item.file_url ? 1 : 0} color="primary" max={99}>
                <DescriptionIcon fontSize="small" color="info" />
              </Badge>
            </IconButton>
          </Tooltip>
          {!item.stock_added && (
            <Tooltip title={translate("finance.nfe.launch")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  nfe.handleLaunch(item);
                }}
              >
                <Inventory2Icon fontSize="small" color="success" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={translate("global.actions.view")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                nfe.handleViewDetails(item);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Nfe>
        title="finance.nfeTitle"
        apiRoute="/api/finance/nfe/paginated-list"
        renderRow={renderRow}
        onEdit={nfe.handleEdit}
        onDelete={nfe.handleDelete}
        hideEdit={(row) => row.stock_added}
      />
      <Fab color="primary" size="small" onClick={nfe.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>
      <NfeModal nfe={nfe} />
      <NfeFileModal nfe={nfe.fileNfe} onClose={nfe.closeFileModal} onFileChange={nfe.handleFileChange} />
    </Box>
  );
}
