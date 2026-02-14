"use client";
import {Button, Grid, MenuItem, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FormIntegerInput} from "@/src/components/form-fields/integer-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFinanceConstants} from "../../../constants";
import {FinanceCategory} from "../../../types";
import {BillFormProps} from "./types";

export function BillForm(props: BillFormProps) {
  const {bills} = props;
  const {translate} = useTranslate();
  const {recurrenceIntervals} = useFinanceConstants();

  const {data: categoriesData} = useApiQuery<FinanceCategory[]>({route: "/api/finance/category/list", queryKey: ["/api/finance/category/list"]});
  const categories = categoriesData || [];

  const isEdit = bills.formType === "edit";

  return (
    <FormContextProvider control={bills.control} errors={bills.errors} formType={bills.formType}>
      <GenericDrawer title={isEdit ? "finance.bills.editTitle" : "finance.bills.createTitle"} show={bills.showDrawer} onClose={bills.closeDrawer}>
        <form onSubmit={bills.handleSubmit(bills.submit)}>
          <Grid container spacing={2}>
            <FormTextInput fieldName="description" label="finance.bills.fields.description" />
            <FormDropdown<FinanceCategory>
              fieldName="category"
              label="finance.bills.fields.category"
              options={categories}
              uniqueKey="id"
              buildLabel={(o) => o.name}
            />
            {!isEdit && (
              <>
                <FormCurrencyInput fieldName="totalAmount" label="finance.bills.fields.totalAmount" />
                <Grid size={12}>
                  <Controller
                    name="recurrenceType"
                    control={bills.control}
                    render={({field: {value, onChange}}) => (
                      <TextField select label={translate("finance.bills.fields.recurrenceType")} value={value} onChange={onChange} fullWidth>
                        <MenuItem value="none">{translate("finance.bills.recurrenceTypes.none")}</MenuItem>
                        <MenuItem value="installment">{translate("finance.bills.recurrenceTypes.installment")}</MenuItem>
                        <MenuItem value="recurring">{translate("finance.bills.recurrenceTypes.recurring")}</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                {bills.recurrenceType === "recurring" && (
                  <Grid size={12}>
                    <Controller
                      name="recurrenceInterval"
                      control={bills.control}
                      render={({field: {value, onChange}}) => (
                        <TextField select label={translate("finance.bills.fields.recurrenceInterval")} value={value} onChange={onChange} fullWidth>
                          {Object.values(recurrenceIntervals).map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                )}
                {(bills.recurrenceType === "installment" || bills.recurrenceType === "recurring") && (
                  <FormIntegerInput fieldName="recurrenceCount" label="finance.bills.fields.recurrenceCount" />
                )}
                <FormDatePicker fieldName="dueDate" label="finance.bills.fields.dueDate" />
              </>
            )}
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
