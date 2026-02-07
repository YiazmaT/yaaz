"use client";
import {Button, Grid} from "@mui/material";
import {useWatch} from "react-hook-form";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormMaskedTextInput} from "@/src/components/form-fields/masked-text-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {translate} = useTranslate();
  const {clients, imageSize = 150} = props;
  const isCompany = useWatch({control: clients.control, name: "isCompany"});

  return (
    <FormContextProvider control={clients.control} errors={clients.errors} formType={clients.formType}>
      <GenericDrawer
        title={clients.formType === "create" ? "clients.createTitle" : clients.formType === "edit" ? "clients.editTitle" : "clients.detailsTitle"}
        show={clients.showDrawer}
        onClose={clients.closeDrawer}
      >
        <form onSubmit={clients.handleSubmit(clients.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="clients.fields.image" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="clients.fields.name" />
            <FormTextInput fieldName="email" label="clients.fields.email" />
            <FormMaskedTextInput fieldName="phone" label="clients.fields.phone" mask="(99) 99999-9999" />
            <FormCheckBox
              fieldName="isCompany"
              label="clients.fields.isCompany"
              additionalOnChange={(checked) => {
                if (checked) {
                  clients.setValue("cpf", "");
                } else {
                  clients.setValue("cnpj", "");
                }
              }}
            />
            {isCompany ? (
              <FormMaskedTextInput fieldName="cnpj" label="clients.fields.cnpj" mask="99.999.999/9999-99" />
            ) : (
              <FormMaskedTextInput fieldName="cpf" label="clients.fields.cpf" mask="999.999.999-99" />
            )}
            {clients.formType !== "details" && (
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
