"use client";
import {Button, Grid} from "@mui/material";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {BankAccountFormProps} from "./types";

export function BankAccountForm(props: BankAccountFormProps) {
  const {bankAccounts} = props;
  const {translate} = useTranslate();

  return (
    <FormContextProvider control={bankAccounts.control} errors={bankAccounts.errors} formType={bankAccounts.formType}>
      <GenericDrawer
        title={bankAccounts.formType === "create" ? "finance.bank.createTitle" : "finance.bank.editTitle"}
        show={bankAccounts.showDrawer}
        onClose={bankAccounts.closeDrawer}
      >
        <form onSubmit={bankAccounts.handleSubmit(bankAccounts.submit)}>
          <Grid container spacing={2}>
            <FormTextInput fieldName="name" label="finance.bank.fields.name" />
            {bankAccounts.formType === "create" && <FormCurrencyInput fieldName="balance" label="finance.bank.fields.balance" />}
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
