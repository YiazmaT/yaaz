"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Sale} from "../types";
import {Form} from "../components/form";
import {MobileViewProps} from "./types";
import {useSalesConstants} from "../constants";

export function MobileView(props: MobileViewProps) {
  const {sales} = props;
  const {translate} = useTranslate();
  const {payment_methods} = useSalesConstants();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function renderRow(item: Sale, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1}}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatCurrency(Number(item.total))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.creation_date ? new Date(item.creation_date).toLocaleString("pt-BR") : "-"}
            </Typography>
          </Box>
          <Chip
            label={translate(payment_methods[item.payment_method]?.label || "")}
            size="small"
            color="primary"
            variant="outlined"
          />
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
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Sale>
        key={sales.tableKey}
        title="sales.title"
        apiRoute="/api/sale/paginated-list"
        renderRow={renderRow}
        onView={sales.handleView}
        onEdit={sales.handleEdit}
        onDelete={sales.handleDelete}
        hideSearch
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
