"use client";
import {Button, Chip, Divider, Grid, Typography, Box} from "@mui/material";
import {FormAsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {FormRadioGroup} from "@/src/components/form-fields/radio-group";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {ImagePreview} from "@/src/components/image-preview";
import {ProductsSelector} from "@/src/components/selectors/products-selector";
import {PackagesSelector} from "@/src/components/selectors/packages-selector";
import {PackageType} from "@/src/pages-content/stock/packages/types";
import {useWatch} from "react-hook-form";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {Client} from "@/src/pages-content/client/types";
import {buildName} from "@/src/pages-content/client/utils";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {sales} = props;
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const isDetails = sales.formType === "details";
  const paymentMethodOptions = sales.paymentMethods.map((pm) => ({
    value: pm.id,
    label: pm.bank_account_name ? `${pm.name} (${pm.bank_account_name})` : pm.name,
  }));
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
            <FormRadioGroup fieldName="payment_method_id" label="sales.fields.paymentMethod" options={paymentMethodOptions} />

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
              <Divider />
            </Grid>

            <FormAsyncDropdown<Client>
              fieldName="client"
              apiRoute="/api/client/paginated-list"
              uniqueKey="id"
              label="sales.fields.client"
              buildLabel={(option) => buildName(option)}
              renderOption={(option) => (
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                  {option.active === false && <Chip label={translate("clients.inactive")} size="small" color="error" />}
                  <ImagePreview url={option.image} alt={option.name} width={30} height={30} />
                  <Typography variant="body2">{buildName(option)}</Typography>
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

            <Grid size={12}>
              <Divider />
            </Grid>

            <FormCurrencyInput
              fieldName="discount_value"
              label="sales.fields.discountValue"
              size={6}
              additionalOnChange={(v) => sales.handleDiscountValueChange(v)}
            />

            <FormDecimalInput
              fieldName="discount_percent"
              label="sales.fields.discountPercent"
              size={6}
              additionalOnChange={(v) => sales.handleDiscountPercentChange(v)}
            />

            {sales.formType === "create" && <FormCheckBox fieldName="is_quote" label="sales.isQuote" />}

            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 2,
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                  gap: 0.5,
                }}
              >
                {sales.discountComputed && Number(sales.discountComputed) > 0 && (
                  <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant="body2" color="error.main">
                      {translate("sales.fields.discount")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      -{formatCurrency(sales.discountComputed)}
                    </Typography>
                  </Box>
                )}
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {translate("sales.fields.total")}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(sales.total)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

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
