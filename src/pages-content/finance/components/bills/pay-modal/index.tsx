"use client";
import {useRef, useState} from "react";
import {FormDateTimePicker} from "@/src/components/form-fields/date-time-picker";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {GenericModal} from "@/src/components/generic-modal";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {flexGenerator} from "@/src/utils/flex-generator";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Button, Grid, Typography} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import {useMemo, useEffect} from "react";
import {useForm, useWatch} from "react-hook-form";
import {BankAccount} from "../../../types";
import {usePayFormConfig} from "./form-config";
import {PayFormValues, PayModalProps} from "./types";

const ACCEPT = "image/*,.pdf";

export function PayModal(props: PayModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const {translate} = useTranslate();
  const {bill, onClose, onSuccess} = props;
  const {schema, defaultValues} = usePayFormConfig();
  const {data: accountsData} = useApiQuery<BankAccount[]>({route: "/api/finance/bank-account/list", queryKey: ["/api/finance/bank-account/list"]});
  const api = useApi();
  const toast = useToaster();
  const accounts = accountsData || [];
  const formatCurrency = useFormatCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<PayFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const selectedAccount = useWatch({control, name: "bankAccount"}) as BankAccount | null;

  const balanceAfterPayment = useMemo(() => {
    if (!selectedAccount || !bill) return null;
    return Number(selectedAccount.balance) - Number(bill.amount);
  }, [selectedAccount, bill]);

  useEffect(() => {
    if (bill) {
      reset({...defaultValues, bankAccount: accounts.length === 1 ? accounts[0] : null});
      setReceiptFile(null);
    }
  }, [bill, accounts]);

  async function submit(data: PayFormValues) {
    if (!bill || !data.bankAccount) return;

    await api.fetch("POST", "/api/finance/bill/pay", {
      body: {
        billId: bill.id,
        bankAccountId: data.bankAccount.id,
        paidDate: data.paidDate,
      },
      onSuccess: async () => {
        if (receiptFile) {
          const formData = new FormData();
          formData.append("billId", bill.id);
          formData.append("file", receiptFile);
          await api.fetch("POST", "/api/finance/bill/upload-receipt", {formData});
        }
        toast.successToast("finance.bills.paySuccess");
        onClose();
        onSuccess();
      },
    });
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setReceiptFile(file);
  }

  return (
    <GenericModal title={translate("finance.bills.payTitle")} open={!!bill} onClose={onClose} maxWidth="sm">
      {bill && (
        <Typography variant="body1" sx={{mb: 2}}>
          {bill.description} — {formatCurrency(String(bill.amount))}
        </Typography>
      )}
      <FormContextProvider control={control} errors={errors} formType="create">
        <form id="pay-form" onSubmit={handleSubmit(submit)}>
          <Grid container spacing={2} sx={{mt: 0.5}}>
            <FormDropdown<BankAccount>
              fieldName="bankAccount"
              label="finance.bills.fields.bankAccount"
              options={accounts}
              uniqueKey="id"
              buildLabel={(o) => `${o.name} (${formatCurrency(String(o.balance))})`}
            />
            <FormDateTimePicker fieldName="paidDate" label="finance.bills.fields.paidDate" />
          </Grid>
        </form>
      </FormContextProvider>

      <input ref={fileInputRef} type="file" accept={ACCEPT} hidden onChange={handleFileSelected} />
      <Box sx={{mt: 2}}>
        {receiptFile ? (
          <Box sx={{...flexGenerator("r.center.space-between"), p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1}}>
            <Box sx={{...flexGenerator("r.center"), gap: 1, minWidth: 0}}>
              <AttachFileIcon fontSize="small" color="primary" />
              <Typography variant="body2" noWrap>
                {receiptFile.name}
              </Typography>
            </Box>
            <Button size="small" onClick={() => setReceiptFile(null)} startIcon={<ClearIcon />}>
              {translate("global.actions.remove")}
            </Button>
          </Box>
        ) : (
          <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current?.click()} fullWidth size="small">
            {translate("finance.bills.attachReceipt")}
          </Button>
        )}
      </Box>

      {balanceAfterPayment !== null && (
        <Typography
          variant="body2"
          sx={{mt: 2, textAlign: "center", color: balanceAfterPayment < 0 || Number(selectedAccount?.balance) < 0 ? "error.main" : "text.secondary"}}
        >
          {translate("finance.bills.fields.balanceAfterPayment")}: {formatCurrency(String(balanceAfterPayment))}
        </Typography>
      )}

      <Box sx={{...flexGenerator("r.center.center"), gap: 1, marginTop: 5}}>
        <Button variant="contained" type="submit" form="pay-form">
          {translate("global.confirm")}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {translate("global.cancel")}
        </Button>
      </Box>
    </GenericModal>
  );
}
