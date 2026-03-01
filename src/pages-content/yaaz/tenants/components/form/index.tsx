"use client";
import {Button, Grid} from "@mui/material";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormColorPicker} from "@/src/components/form-fields/color-picker";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {tenants, imageSize = 150} = props;
  const {translate} = useTranslate();

  return (
    <FormContextProvider control={tenants.control} errors={tenants.errors} formType={tenants.formType}>
      <GenericDrawer
        title={tenants.formType === "create" ? "tenants.createTitle" : tenants.formType === "edit" ? "tenants.editTitle" : "tenants.detailsTitle"}
        show={tenants.showDrawer}
        onClose={tenants.closeDrawer}
      >
        <form onSubmit={tenants.handleSubmit(tenants.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="logo" label="tenants.fields.logo" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="tenants.fields.name" />
            <FormColorPicker fieldName="primary_color" label="tenants.fields.primaryColor" />
            <FormColorPicker fieldName="secondary_color" label="tenants.fields.secondaryColor" />
            <FormTextInput fieldName="time_zone" label="tenants.fields.timeZone" />
            <FormTextInput fieldName="currency_type" label="tenants.fields.currencyType" />
            {tenants.formType !== "details" && (
              <Grid size={12}>
                <Button variant="contained" type="submit" fullWidth>
                  {translate("global.confirm")}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </GenericDrawer>
    </FormContextProvider>
  );
}
