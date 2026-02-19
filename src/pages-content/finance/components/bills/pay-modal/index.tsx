"use client";
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
import {useMemo, useEffect} from "react";
import {useForm, useWatch} from "react-hook-form";
import {BankAccount} from "../../../types";
import {usePayFormConfig} from "./form-config";
import {PayFormValues, PayModalProps} from "./types";

export function PayModal(props: PayModalProps) {
  const {translate} = useTranslate();
  const {bill, onClose, onSuccess} = props;
  const {schema, defaultValues} = usePayFormConfig();
  const api = useApi();
  const toast = useToaster();
  const formatCurrency = useFormatCurrency();
  const {data: accountsData} = useApiQuery<BankAccount[]>({route: "/api/finance/bank-account/list", queryKey: ["/api/finance/bank-account/list"]});
  const accounts = accountsData || [];

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
      onSuccess: () => {
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
