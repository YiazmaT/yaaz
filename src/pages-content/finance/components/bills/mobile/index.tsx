"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import UndoIcon from "@mui/icons-material/Undo";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/lib/format-date";
import {BillInstallment} from "../../../types";
import {useFinanceConstants} from "../../../constants";
import {isOverdue} from "../../../utils";
import {BillForm} from "../form";
import {PayModal} from "../pay-modal";
import {useBills} from "../use-bills";

export function BillsMobile() {
  const {translate} = useTranslate();
  const {billStatuses} = useFinanceConstants();
  const formatCurrency = useFormatCurrency();
  const bills = useBills();
  const theme = useTheme();

  function renderRow(item: BillInstallment, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              #{item.bill.code} {item.bill.description}
            </Typography>
            {item.bill.category && (
              <Typography variant="body2" color="text.secondary">
                {item.bill.category.name}
              </Typography>
            )}
            <Box sx={{display: "flex", gap: 1, mt: 0.5, alignItems: "center"}}>
              <Chip
                label={isOverdue(item) ? translate("finance.bills.statuses.overdue") : billStatuses[item.status as keyof typeof billStatuses]?.label}
                size="small"
                color={isOverdue(item) ? "error" : billStatuses[item.status as keyof typeof billStatuses]?.color || "default"}
              />
              {item.bill.recurrence_type !== "none" && (
                <Typography variant="caption" color="text.secondary">
                  {item.installment_number}/{item.bill.recurrence_count}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{textAlign: "right"}}>
            <Typography variant="body1" fontWeight={600}>
              {formatCurrency(String(item.amount))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.due_date)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}`}}>
          {item.status !== "paid" && (
            <Tooltip title={translate("finance.bills.pay")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  bills.handlePay(item);
                }}
              >
                <PaymentIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          )}
          {item.status === "paid" && (
            <Tooltip title={translate("finance.bills.cancelPayment")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  bills.handleCancelPayment(item);
                }}
              >
                <UndoIcon fontSize="small" color="warning" />
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
      <MobileList<BillInstallment>
        title="finance.bills.title"
        apiRoute="/api/finance/bill/paginated-list"
        renderRow={renderRow}
        onEdit={bills.handleEdit}
        hideEdit={(row) => row.status === "paid"}
        onDelete={bills.handleDelete}
        filters={bills.filters}
      />
      <Fab color="primary" size="small" onClick={bills.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>
      <BillForm bills={bills} />
      <PayModal installment={bills.payInstallment} onClose={bills.closePayModal} onSuccess={bills.refreshTable} />
    </Box>
  );
}
