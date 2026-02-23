"use client";
import {ReactNode} from "react";
import {Badge, Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import UndoIcon from "@mui/icons-material/Undo";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/utils/format-date";
import {useFinanceConstants} from "../constants";
import {isOverdue} from "../utils";
import {BillForm} from "../components/form";
import {BillsFilters} from "../components/filters";
import {PayModal} from "../components/pay-modal";
import {ReceiptModal} from "../components/receipt-modal";
import {useBills} from "../use-bills";
import {Bill} from "../types";

export function BillsMobile() {
  const {translate} = useTranslate();
  const {billStatuses} = useFinanceConstants();
  const formatCurrency = useFormatCurrency();
  const bills = useBills();
  const theme = useTheme();

  function renderRow(item: Bill, actions: ReactNode) {
    const overdue = isOverdue(item);
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              #{item.code} {item.description}
            </Typography>
            {item.category && (
              <Typography variant="body2" color="text.secondary">
                {item.category.name}
              </Typography>
            )}
            <Box sx={{display: "flex", gap: 1, mt: 0.5, alignItems: "center"}}>
              <Chip
                label={overdue ? translate("finance.bills.statuses.overdue") : billStatuses[item.status as keyof typeof billStatuses]?.label}
                size="small"
                color={overdue ? "error" : billStatuses[item.status as keyof typeof billStatuses]?.color || "default"}
              />
              {item.installment_count > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {item.installment_number}/{item.installment_count}
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
            <>
              <Tooltip title={translate("finance.bills.receipt")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    bills.handleViewReceipt(item);
                  }}
                >
                  <Badge badgeContent={item.receipt_url ? 1 : 0} color="primary" max={99}>
                    <ReceiptIcon fontSize="small" color="info" />
                  </Badge>
                </IconButton>
              </Tooltip>
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
            </>
          )}
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Bill>
        title="finance.bills.title"
        apiRoute="/api/finance/bill/paginated-list"
        renderRow={renderRow}
        onEdit={bills.handleEdit}
        hideEdit={(row) => row.status === "paid"}
        onDelete={bills.handleDelete}
        filters={bills.filters}
        headerContent={<BillsFilters onFilterChange={bills.handleFilterChange} />}
      />
      <Fab color="primary" size="small" onClick={bills.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>
      <BillForm bills={bills} />
      <PayModal bill={bills.payBill} onClose={bills.closePayModal} onSuccess={bills.refreshTable} />
      <ReceiptModal bill={bills.receiptBill} onClose={bills.closeReceiptModal} onReceiptChange={bills.handleReceiptChange} />
    </Box>
  );
}
