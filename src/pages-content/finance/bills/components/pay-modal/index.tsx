"use client";
import {useState} from "react";
import {FormDateTimePicker} from "@/src/components/form-fields/date-time-picker";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {GenericModal} from "@/src/components/generic-modal";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useR2Upload} from "@/src/hooks/use-r2-upload";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {FileUploader} from "@/src/components/file-uploader";
import {flexGenerator} from "@/src/utils/flex-generator";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Button, Grid, Typography} from "@mui/material";
import {useMemo, useEffect} from "react";
import {useForm, useWatch} from "react-hook-form";
import {usePayFormConfig} from "./form-config";
import {PayFormValues, PayModalProps} from "./types";
import {BankAccount} from "../../../bank-accounts/types";

const ACCEPT = "image/*,.pdf";

export function PayModal(props: PayModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const {translate} = useTranslate();
  const {bill, onClose, onSuccess} = props;
  const {upload, deleteOrphan} = useR2Upload();
  const {schema, defaultValues} = usePayFormConfig();
  const {data: accountsData} = useApiQuery<BankAccount[]>({route: "/api/finance/bank-account/list", queryKey: ["/api/finance/bank-account/list"]});
  const api = useApi();
  const toast = useToaster();
  const accounts = accountsData || [];
  const formatCurrency = useFormatCurrency();
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
    if (!bill) return;

    await api.fetch("POST", "/api/finance/bill/pay", {
      body: {
        billId: bill.id,
        bankAccountId: data.bankAccount?.id ?? null,
        paidDate: data.paidDate,
      },
      onSuccess: async () => {
        if (receiptFile) {
          const r2Result = await upload(receiptFile, "bill-receipts");
          if (r2Result) {
            const registered = await api.fetch("POST", "/api/finance/bill/register-receipt", {
              body: {billId: bill.id, url: r2Result.url},
              hideLoader: true,
            });
            if (!registered) await deleteOrphan(r2Result.url);
          }
        }
        toast.successToast("finance.bills.paySuccess");
        onClose();
        onSuccess();
      },
    });
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

      <Box sx={{mt: 2}}>
        <FileUploader value={receiptFile} onChange={setReceiptFile} accept={ACCEPT} height={90} />
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
