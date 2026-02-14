"use client";
import {useState} from "react";
import {Box, Button, Chip, Divider, IconButton, Pagination, Tooltip, Typography} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useQueryClient} from "@tanstack/react-query";
import {formatDate} from "@/src/lib/format-date";
import {BankTransaction} from "../../../types";
import {TransactionForm} from "../transaction-form";
import {StatementDrawerProps} from "./types";

const STATEMENT_ROUTE = "/api/finance/bank-account/statement";
const ACCOUNTS_ROUTE = "/api/finance/bank-account/paginated-list";

export function StatementDrawer(props: StatementDrawerProps) {
  const [page, setPage] = useState(1);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const {translate} = useTranslate();
  const {account, onClose, onTableRefresh} = props;
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();
  const formatCurrency = useFormatCurrency();

  const {data: statementData} = useApiQuery<any>({
    route: `${STATEMENT_ROUTE}?bankAccountId=${account?.id}&page=${page}&limit=20`,
    queryKey: [STATEMENT_ROUTE, account?.id, page],
    enabled: !!account,
  });

  const transactions: BankTransaction[] = statementData?.data || [];
  const total = statementData?.total || 0;
  const accountInfo = statementData?.account;
  const totalPages = Math.ceil(total / 20);

  function refreshStatement() {
    queryClient.invalidateQueries({queryKey: [STATEMENT_ROUTE]});
    queryClient.invalidateQueries({queryKey: [ACCOUNTS_ROUTE]});
    onTableRefresh();
  }

  function handleDeleteTransaction(transaction: BankTransaction) {
    if (transaction.bill_installment_id) return;
    showConfirmModal({
      message: "finance.bank.deleteTransactionConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/bank-transaction/delete", {
          body: {id: transaction.id},
          onSuccess: () => {
            toast.successToast("finance.bank.deleteTransactionSuccess");
            refreshStatement();
          },
        });
      },
    });
  }

  function getTransactionTypeColor(type: string) {
    if (type === "deposit") return "success.main";
    return "error.main";
  }

  function getTransactionTypeLabel(type: string) {
    return translate(`finance.bank.transactionTypes.${type}`);
  }

  return (
    <>
      <GenericDrawer title="finance.bank.statementTitle" show={!!account} onClose={onClose}>
        {accountInfo && (
          <Box sx={{mb: 2}}>
            <Typography variant="h6" fontWeight={600}>
              {accountInfo.name}
            </Typography>
            <Typography variant="body1" sx={{color: Number(accountInfo.balance) < 0 ? "error.main" : "success.main", fontWeight: 600}}>
              {translate("finance.bank.fields.balance")}: {formatCurrency(String(accountInfo.balance))}
            </Typography>
          </Box>
        )}

        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowTransactionForm(true)} sx={{mb: 2}} fullWidth>
          {translate("finance.bank.addTransaction")}
        </Button>

        <Divider sx={{mb: 2}} />

        {transactions.length === 0 && (
          <Typography color="text.secondary" sx={{textAlign: "center", py: 4}}>
            {translate("global.noDataFound")}
          </Typography>
        )}

        {transactions.map((t) => (
          <Box
            key={t.id}
            sx={{display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid", borderColor: "divider"}}
          >
            <Box sx={{flex: 1, minWidth: 0}}>
              <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Chip label={getTransactionTypeLabel(t.type)} size="small" sx={{backgroundColor: getTransactionTypeColor(t.type), color: "white"}} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(t.date)}
                </Typography>
              </Box>
              <Typography variant="body2" noWrap sx={{mt: 0.5}}>
                {t.description || (t.bill_installment ? `${t.bill_installment.bill.description} #${t.bill_installment.bill.code}` : "-")}
              </Typography>
              {t.category && (
                <Typography variant="caption" color="text.secondary">
                  {t.category.name}
                </Typography>
              )}
            </Box>
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Typography variant="body1" fontWeight={600} sx={{color: getTransactionTypeColor(t.type)}}>
                {t.type === "deposit" ? "+" : "-"}
                {formatCurrency(String(t.amount))}
              </Typography>
              {!t.bill_installment_id && (
                <Tooltip title={translate("global.actions.delete")}>
                  <IconButton size="small" onClick={() => handleDeleteTransaction(t)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        ))}

        {totalPages > 1 && (
          <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} size="small" />
          </Box>
        )}
      </GenericDrawer>

      {account && (
        <TransactionForm
          show={showTransactionForm}
          onClose={() => setShowTransactionForm(false)}
          bankAccountId={account.id}
          onSuccess={refreshStatement}
        />
      )}
    </>
  );
}
