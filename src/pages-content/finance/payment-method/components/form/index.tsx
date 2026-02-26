"use client";
import {Button, Grid} from "@mui/material";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormAsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {BankAccountOption} from "../../types";
import {PaymentMethodFormProps} from "./types";

export function PaymentMethodForm(props: PaymentMethodFormProps) {
  const {translate} = useTranslate();
  const {paymentMethods} = props;

  return (
    <FormContextProvider control={paymentMethods.control} errors={paymentMethods.errors} formType={paymentMethods.formType}>
      <GenericDrawer
        title={paymentMethods.formType === "create" ? "finance.paymentMethod.createTitle" : "finance.paymentMethod.editTitle"}
        show={paymentMethods.showDrawer}
        onClose={paymentMethods.closeDrawer}
      >
        <form onSubmit={paymentMethods.handleSubmit(paymentMethods.submit)}>
          <Grid container spacing={2}>
            <FormTextInput fieldName="name" label="finance.paymentMethod.fields.name" />
            <FormAsyncDropdown<BankAccountOption>
              fieldName="bank_account"
              label="finance.paymentMethod.fields.bankAccount"
              apiRoute="/api/finance/bank-account/paginated-list"
              uniqueKey="id"
              buildLabel={(option) => option.name}
            />
          </Grid>
          <Grid container spacing={1} sx={{mt: 2}}>
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
