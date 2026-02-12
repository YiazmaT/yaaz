"use client";
import {useState} from "react";
import {Box, Button, Grid, Tab, Tabs} from "@mui/material";
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
  const [tab, setTab] = useState(0);
  const {translate} = useTranslate();
  const {clients, imageSize = 150} = props;
  const isCompany = useWatch({control: clients.control, name: "isCompany"});

  async function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();
      if (data.erro) return;

      clients.setValue("address.address", data.logradouro || "");
      clients.setValue("address.neighborhood", data.bairro || "");
      clients.setValue("address.city", data.localidade || "");
      clients.setValue("address.state", data.uf || "");
    } catch {
      // ViaCEP unavailable, user can fill manually
    }
  }

  return (
    <FormContextProvider control={clients.control} errors={clients.errors} formType={clients.formType}>
      <GenericDrawer
        title={clients.formType === "create" ? "clients.createTitle" : clients.formType === "edit" ? "clients.editTitle" : "clients.detailsTitle"}
        show={clients.showDrawer}
        onClose={clients.closeDrawer}
      >
        <form onSubmit={clients.handleSubmit(clients.submit)}>
          <Box sx={{borderBottom: 1, borderColor: "divider", mb: 2}}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label={translate("clients.tabs.general")} />
              <Tab label={translate("clients.tabs.address")} />
            </Tabs>
          </Box>

          <Grid container spacing={2} sx={{display: tab === 0 ? undefined : "none"}}>
            <FormImageInput fieldName="image" label="clients.fields.image" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="clients.fields.name" />
            <FormTextInput fieldName="description" label="clients.fields.description" multiline />
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
          </Grid>

          <Grid container spacing={2} sx={{display: tab === 1 ? undefined : "none"}}>
            <FormMaskedTextInput fieldName="address.cep" label="clients.fields.cep" mask="99999-999" size={4} additionalOnChange={handleCepChange} />
            <FormTextInput fieldName="address.address" label="clients.fields.address" size={8} />
            <FormTextInput fieldName="address.number" label="clients.fields.number" size={4} />
            <FormTextInput fieldName="address.complement" label="clients.fields.complement" size={8} />
            <FormTextInput fieldName="address.neighborhood" label="clients.fields.neighborhood" size={4} />
            <FormTextInput fieldName="address.city" label="clients.fields.city" size={4} />
            <FormTextInput fieldName="address.state" label="clients.fields.state" size={4} />
          </Grid>

          {clients.formType !== "details" && (
            <Grid container spacing={2} sx={{mt: 1}}>
              <Grid size={12}>
                <Button variant="contained" type="submit" fullWidth>
                  {translate("global.confirm")}
                </Button>
              </Grid>
            </Grid>
          )}
        </form>
      </GenericDrawer>
    </FormContextProvider>
  );
}
