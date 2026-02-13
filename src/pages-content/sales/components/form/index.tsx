"use client";
import {Button, Chip, Divider, Grid, Typography, Box} from "@mui/material";
import {FormAsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {FormRadioGroup} from "@/src/components/form-fields/radio-group";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {ImagePreview} from "@/src/components/image-preview";
import {ProductsSelector} from "@/src/components/products-selector";
import {PackagesSelector} from "@/src/components/packages-selector";
import {PackageType} from "@/src/pages-content/packages/types";
import {useWatch} from "react-hook-form";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {Client} from "@/src/pages-content/client/types";
import {useSalesConstants} from "../../constants";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {sales} = props;
  const {translate} = useTranslate();
  const {payment_methods} = useSalesConstants();
  const formatCurrency = useFormatCurrency();
  const isDetails = sales.formType === "details";
  const paymentMethodOptions = Object.values(payment_methods);
  const selectedClient = useWatch({control: sales.control, name: "client"}) as Client | null;

  return (
    <FormContextProvider control={sales.control} errors={sales.errors} formType={sales.formType}>
      <GenericDrawer
        title={sales.formType === "create" ? "sales.createTitle" : sales.formType === "edit" ? "sales.editTitle" : "sales.detailsTitle"}
        show={sales.showDrawer}
        onClose={sales.closeDrawer}
      >
        <form onSubmit={sales.handleSubmit(sales.submit)}>
          <Grid container spacing={2}>
            <FormRadioGroup fieldName="payment_method" label="sales.fields.paymentMethod" options={paymentMethodOptions} />

            <Grid size={12}>
              <Divider />
            </Grid>

            <ProductsSelector
              value={sales.items}
              onChange={sales.setItems}
              disabled={isDetails}
              incrementOnDuplicate
              priceChangeText={translate("sales.priceChangeWarning.originalPriceWas")}
            />

            <Grid size={12}>
              <Divider />
            </Grid>

            <PackagesSelector value={sales.packages} onChange={sales.setPackages} disabled={isDetails} typeFilter={PackageType.sale} />

            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 2,
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {translate("sales.fields.total")}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {formatCurrency(sales.total)}
                </Typography>
              </Box>
            </Grid>

            <FormAsyncDropdown<Client>
              fieldName="client"
              apiRoute="/api/client/paginated-list"
              uniqueKey="id"
              label="sales.fields.client"
              buildLabel={(option) => option.name}
              renderOption={(option) => (
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                  {option.active === false && <Chip label={translate("clients.inactive")} size="small" color="error" />}
                  <ImagePreview url={option.image} alt={option.name} width={30} height={30} />
                  <Typography variant="body2">{option.name}</Typography>
                </Box>
              )}
              startAdornment={
                selectedClient ? (
                  <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                    {selectedClient.active === false && <Chip label={translate("clients.inactive")} size="small" color="error" />}
                    <ImagePreview url={selectedClient.image} alt={selectedClient.name} width={24} height={24} />
                  </Box>
                ) : undefined
              }
            />

            {sales.formType === "create" && <FormCheckBox fieldName="is_quote" label="sales.isQuote" />}

            {!isDetails && (
              <Grid size={12}>
                <Button variant="contained" type="submit" fullWidth disabled={sales.items.length === 0 && sales.packages.length === 0}>
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
