"use client";
import {useEffect} from "react";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, Grid, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {FormDateTimePicker} from "@/src/components/form-fields/date-time-picker";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useToaster} from "@/src/contexts/toast-context";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FinanceCategory} from "../../../types";
import {TransactionFormValues, useTransactionFormConfig} from "./form-config";
import {TransactionFormProps} from "./type";

export function TransactionForm(props: TransactionFormProps) {
  const {translate} = useTranslate();
  const {show, onClose, bankAccountId, onSuccess} = props;
  const {schema, defaultValues} = useTransactionFormConfig();
  const api = useApi();
  const toast = useToaster();

  const {data: categoriesData} = useApiQuery<FinanceCategory[]>({route: "/api/finance/category/list", queryKey: ["/api/finance/category/list"]});
  const categories = categoriesData || [];

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<TransactionFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (show) {
      reset(defaultValues);
    }
  }, [show]);

  async function submit(data: TransactionFormValues) {
    await api.fetch("POST", "/api/finance/bank-transaction/create", {
      body: {
        bankAccountId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        date: data.date,
        categoryId: data.category?.id || null,
      },
      onSuccess: () => {
        toast.successToast("finance.bank.transactionSuccess");
        reset();
        onClose();
        onSuccess();
      },
    });
  }

  return (
    <FormContextProvider control={control} errors={errors} formType="create">
      <GenericDrawer title="finance.bank.addTransaction" show={show} onClose={onClose}>
        <form onSubmit={handleSubmit(submit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="type"
                control={control}
                render={({field: {value, onChange}}) => (
                  <ToggleButtonGroup value={value} exclusive onChange={(_, v) => v && onChange(v)} fullWidth>
                    <ToggleButton value="deposit" color="success">
                      {translate("finance.bank.transactionTypes.deposit")}
                    </ToggleButton>
                    <ToggleButton value="withdrawal" color="error">
                      {translate("finance.bank.transactionTypes.withdrawal")}
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Grid>
            <FormCurrencyInput fieldName="amount" label="finance.bank.fields.amount" />
            <FormDateTimePicker fieldName="date" label="finance.bank.fields.date" />
            <FormTextInput fieldName="description" label="finance.bank.fields.description" />
            <FormDropdown<FinanceCategory>
              fieldName="category"
              label="finance.bank.fields.category"
              options={categories}
              uniqueKey="id"
              buildLabel={(o) => o.name}
            />
          </Grid>
          <Grid container spacing={2} sx={{mt: 1}}>
            <Grid size={12}>
              <Button variant="contained" type="submit" fullWidth>
                {translate("global.confirm")}
              </Button>
            </Grid>
          </Grid>
        </form>
      </GenericDrawer>
    </FormContextProvider>
  );
}
