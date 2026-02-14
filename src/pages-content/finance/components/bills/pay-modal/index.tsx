"use client";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
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
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {BankAccount} from "../../../types";
import {PayFormValues, PayModalProps} from "./types";

export function PayModal(props: PayModalProps) {
  const {installment, onClose, onSuccess} = props;
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const api = useApi();
  const toast = useToaster();

  const {data: accountsData} = useApiQuery<BankAccount[]>({route: "/api/finance/bank-account/list", queryKey: ["/api/finance/bank-account/list"]});
  const accounts = accountsData || [];

  const schema = yup.object().shape({
    bankAccount: yup
      .object()
      .required()
      .nullable()
      .test("required", translate("finance.bills.errors.selectAccount"), (v) => !!v),
    paidDate: yup.string().required().label(translate("finance.bills.fields.paidDate")),
  });

  const today = new Date().toISOString().split("T")[0];

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<PayFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues: {bankAccount: null, paidDate: today},
  });

  useEffect(() => {
    if (installment) {
      reset({bankAccount: null, paidDate: today});
    }
  }, [installment]);

  async function submit(data: PayFormValues) {
    if (!installment || !data.bankAccount) return;

    await api.fetch("POST", "/api/finance/bill/pay", {
      body: {
        installmentId: installment.id,
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
    <GenericModal title={translate("finance.bills.payTitle")} open={!!installment} onClose={onClose} maxWidth="sm">
      {installment && (
        <Typography variant="body1" sx={{mb: 2}}>
          {installment.bill.description} — {formatCurrency(String(installment.amount))}
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
            <FormDatePicker fieldName="paidDate" label="finance.bills.fields.paidDate" />
          </Grid>
        </form>
      </FormContextProvider>

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
