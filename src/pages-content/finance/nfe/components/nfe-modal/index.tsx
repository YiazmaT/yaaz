"use client";
import {} from "react";
import {Box, Button, Divider, Grid, TableCell, TableRow, Typography} from "@mui/material";
import Decimal from "decimal.js";
import {GenericModal} from "@/src/components/generic-modal";
import {DefaultTable} from "@/src/components/core-table";
import {FileUploader} from "@/src/components/file-uploader";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {IngredientsSelector} from "@/src/components/selectors/ingredients-selector";
import {ProductsSelector} from "@/src/components/selectors/products-selector";
import {PackagesSelector} from "@/src/components/selectors/packages-selector";
import {Product} from "@/src/pages-content/stock/products/types";
import {flexGenerator} from "@/src/utils/flex-generator";
import {NfeFormItem} from "../../form-config";
import {NfeModalProps} from "./types";
import {Ingredient} from "@/src/pages-content/stock/ingredients/types";
import {Package} from "@/src/pages-content/stock/packages/types";
import {useNfeItemsTableConfig} from "./table-config";

const ACCEPT = "image/*,.pdf";

export function NfeModal(props: NfeModalProps) {
  const {nfe} = props;
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const isCreate = nfe.formType === "create";
  const isDetails = nfe.formType === "details";

  const file = nfe.watch("file");
  const items = nfe.watch("items");

  const {generateItemsConfig} = useNfeItemsTableConfig({
    onRemove: (index) => {
      nfe.setValue(
        "items",
        items.filter((_: NfeFormItem, i: number) => i !== index),
        {shouldValidate: true},
      );
    },
  });

  const totalAmount = items.reduce((sum: Decimal, item: NfeFormItem) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum.plus(new Decimal(qty).times(price));
  }, new Decimal(0));

  function addItem(
    option: {id: string; name: string; image?: string | null; unity_of_measure?: {unity: string} | null; stock?: string},
    itemType: "ingredient" | "product" | "package",
  ) {
    const alreadyExists = items.some((i: NfeFormItem) => i.itemId === option.id && i.itemType === itemType);
    if (alreadyExists) return;

    const newItem: NfeFormItem = {
      id: crypto.randomUUID(),
      itemType,
      itemId: option.id,
      name: option.name,
      image: option.image,
      unityOfMeasure: option.unity_of_measure?.unity || "",
      stock: Number(option.stock ?? 0),
      quantity: "1",
      unitPrice: "0",
    };
    nfe.setValue("items", [...items, newItem], {shouldValidate: true});
  }

  function getModalTitle() {
    if (isCreate) return "finance.nfe.createTitle";
    if (isDetails) return "finance.nfe.detailsTitle";
    return "finance.nfe.editTitle";
  }

  const footerRow =
    items.length > 0 ? (
      <TableRow>
        <TableCell colSpan={4} align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {translate("finance.nfe.fields.totalAmount")}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="subtitle2" fontWeight={600}>
            {formatCurrency(totalAmount.toDecimalPlaces(2).toString())}
          </Typography>
        </TableCell>
        <TableCell />
      </TableRow>
    ) : undefined;

  return (
    <GenericModal title={getModalTitle()} open={nfe.showModal} onClose={nfe.closeModal} maxWidth="lg">
      <FormContextProvider control={nfe.control} errors={nfe.errors} formType={nfe.formType}>
        <form id="nfe-form" onSubmit={nfe.handleSubmit(nfe.submit)}>
          <Grid container spacing={2} sx={{marginTop: 2}}>
            <FormTextInput fieldName="description" label="finance.nfe.fields.description" size={4} />
            <FormTextInput fieldName="nfeNumber" label="finance.nfe.fields.nfeNumber" size={2} />
            <FormTextInput fieldName="supplier" label="finance.nfe.fields.supplier" size={3} />
            <FormDatePicker fieldName="date" label="finance.nfe.fields.date" size={3} />
          </Grid>

          <Divider sx={{my: 2}} />

          {!isDetails && (
            <>
              <Typography variant="subtitle2" sx={{mb: 1}}>
                {translate("finance.nfe.items.add")}
              </Typography>
              <Grid container spacing={2} sx={{mb: 2}}>
                <Grid size={4}>
                  <IngredientsSelector value={[]} onChange={() => {}} onSelect={(ingredient: Ingredient) => addItem(ingredient, "ingredient")} />
                </Grid>
                <Grid size={4}>
                  <ProductsSelector value={[]} onChange={() => {}} onSelect={(product: Product) => addItem(product, "product")} />
                </Grid>
                <Grid size={4}>
                  <PackagesSelector value={[]} onChange={() => {}} onSelect={(pkg: Package) => addItem(pkg, "package")} />
                </Grid>
              </Grid>
            </>
          )}

          {isDetails && (
            <Typography variant="subtitle2" sx={{mb: 1}}>
              {translate("finance.nfe.fields.items")}
            </Typography>
          )}

          <DefaultTable<NfeFormItem>
            data={items}
            columns={generateItemsConfig(isDetails)}
            emptyMessageKey="finance.nfe.items.noItems"
            footerRow={footerRow}
          />

          {nfe.errors.items && typeof nfe.errors.items.message === "string" && (
            <Typography variant="caption" color="error" sx={{mt: 1, display: "block"}}>
              {nfe.errors.items.message}
            </Typography>
          )}

          {isCreate && (
            <>
              <Divider sx={{my: 2}} />
              <FileUploader value={file} onChange={(f) => nfe.setValue("file", f)} accept={ACCEPT} />
              <Box sx={{mt: 1}}>
                <FormCheckBox fieldName="createBill" label="finance.nfe.fields.createBill" grid={false} />
              </Box>
              <Box sx={{mt: 0.5}}>
                <FormCheckBox fieldName="addToStock" label="finance.nfe.fields.addToStock" grid={false} />
              </Box>
            </>
          )}

          {!isDetails && (
            <Box sx={{...flexGenerator("r.center.center"), gap: 1, mt: 3}}>
              <Button variant="contained" type="submit" form="nfe-form">
                {translate("global.confirm")}
              </Button>
              <Button onClick={nfe.closeModal} variant="outlined">
                {translate("global.cancel")}
              </Button>
            </Box>
          )}
        </form>
      </FormContextProvider>
    </GenericModal>
  );
}
