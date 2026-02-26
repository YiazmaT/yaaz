"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Sale} from "../types";
import {Form} from "../components/form";
import {MobileViewProps} from "./types";

export function MobileView(props: MobileViewProps) {
  const {sales} = props;
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function renderRow(item: Sale, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1}}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              #{item.id.split("-").pop()?.toUpperCase()}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatCurrency(Number(item.total))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.creation_date ? new Date(item.creation_date).toLocaleString("pt-BR") : "-"}
            </Typography>
            {item.client && (
              <Typography variant="body2" color="text.secondary">
                {item.client.name}
              </Typography>
            )}
          </Box>
          <Box sx={{display: "flex", gap: 0.5}}>
            {item.is_quote && (
              <Chip label={translate("sales.quote")} size="small" color="warning" />
            )}
            <Chip
              label={item.payment_method?.name ?? ""}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <Typography variant="body2" color="text.secondary">
            {item.items?.length || 0} {translate("sales.fields.items").toLowerCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translate("sales.fields.approximateCost")}: {formatCurrency(Number(item.approximate_cost || 0))}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tooltip title={translate("sales.downloadPdf")}>
            <IconButton size="small" onClick={() => sales.handleDownloadPdf(item)}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {item.is_quote && (
            <Tooltip title={translate("sales.convertQuote")}>
              <IconButton size="small" onClick={() => sales.handleConvertQuote(item)}>
                <ShoppingCartCheckout fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Sale>
        title="sales.title"
        apiRoute="/api/sale/paginated-list"
        renderRow={renderRow}
        onView={sales.handleView}
        onEdit={sales.handleEdit}
        onDelete={sales.handleDelete}
      />

      <Fab
        color="primary"
        size="small"
        onClick={sales.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form sales={sales} />
    </Box>
  );
}
