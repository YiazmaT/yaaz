"use client";
import {Box, Button, Chip, Divider, IconButton, Typography} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {GenericDrawer} from "@/src/components/generic-drawer";
import Decimal from "decimal.js";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FileUploader} from "@/src/components/file-uploader";
import {IngredientsSelector} from "@/src/components/selectors/ingredients-selector";
import {ProductsSelector} from "@/src/components/selectors/products-selector";
import {PackagesSelector} from "@/src/components/selectors/packages-selector";
import {ImagePreview} from "@/src/components/image-preview";
import {NfeFormItem} from "../../form-config";
import {NfeDrawerProps} from "./types";
import {Ingredient} from "@/src/pages-content/stock/ingredients/types";
import {Product} from "@/src/pages-content/stock/products/types";
import {Package} from "@/src/pages-content/stock/packages/types";

const ACCEPT = "image/*,.pdf";

export function NfeDrawer(props: NfeDrawerProps) {
  const {nfe} = props;
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const isCreate = nfe.formType === "create";
  const isDetails = nfe.formType === "details";

  const file = nfe.watch("file");
  const items = nfe.watch("items");

  const totalAmount = items.reduce((sum: Decimal, item: NfeFormItem) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum.plus(new Decimal(qty).times(price));
  }, new Decimal(0));

  const itemTypeLabels: Record<string, string> = {
    ingredient: translate("global.ingredients"),
    product: translate("global.products"),
    package: translate("global.packages"),
  };

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

  function removeItem(index: number) {
    nfe.setValue(
      "items",
      items.filter((_: NfeFormItem, i: number) => i !== index),
      {shouldValidate: true},
    );
  }

  function getTitle() {
    if (isCreate) return "finance.nfe.createTitle";
    if (isDetails) return "finance.nfe.detailsTitle";
    return "finance.nfe.editTitle";
  }

  return (
    <GenericDrawer title={getTitle()} show={nfe.showModal} onClose={nfe.closeModal}>
      <FormContextProvider control={nfe.control} errors={nfe.errors} formType={nfe.formType}>
        <form id="nfe-drawer-form" onSubmit={nfe.handleSubmit(nfe.submit)}>
          <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
            <FormTextInput fieldName="description" label="finance.nfe.fields.description" grid={false} />
            <FormTextInput fieldName="nfeNumber" label="finance.nfe.fields.nfeNumber" grid={false} />
            <FormTextInput fieldName="supplier" label="finance.nfe.fields.supplier" grid={false} />
            <FormDatePicker fieldName="date" label="finance.nfe.fields.date" grid={false} />
          </Box>

          <Divider sx={{my: 2}} />

          <Typography variant="subtitle2" sx={{mb: 1.5}}>
            {isDetails ? translate("finance.nfe.fields.items") : translate("finance.nfe.items.add")}
          </Typography>

          {!isDetails && (
            <Box sx={{display: "flex", flexDirection: "column", gap: 1.5, mb: 2}}>
              <IngredientsSelector value={[]} onChange={() => {}} onSelect={(ingredient: Ingredient) => addItem(ingredient, "ingredient")} />
              <ProductsSelector value={[]} onChange={() => {}} onSelect={(product: Product) => addItem(product, "product")} />
              <PackagesSelector value={[]} onChange={() => {}} onSelect={(pkg: Package) => addItem(pkg, "package")} />
            </Box>
          )}

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{textAlign: "center", py: 2}}>
              {translate("finance.nfe.items.noItems")}
            </Typography>
          ) : (
            <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
              {items.map((item: NfeFormItem, index: number) => (
                <Box key={item.id} sx={{border: 1, borderColor: "divider", borderRadius: 1.5, p: 1.5}}>
                  <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
                    <ImagePreview url={item.image} alt={item.name} width={32} height={32} borderRadius={1} />
                    <Box sx={{flex: 1, minWidth: 0}}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {item.name}
                      </Typography>
                      <Box sx={{display: "flex", gap: 0.5, alignItems: "center"}}>
                        <Chip label={itemTypeLabels[item.itemType]} size="small" variant="outlined" sx={{height: 18, fontSize: 10}} />
                        {item.unityOfMeasure && (
                          <Typography variant="caption" color="text.secondary">
                            ({item.unityOfMeasure})
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {!isDetails && (
                      <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {isDetails ? (
                    <Box sx={{display: "flex", gap: 1}}>
                      <Box sx={{flex: 1}}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {translate("finance.nfe.items.quantity")}
                        </Typography>
                        <Typography variant="body2">{item.quantity}</Typography>
                      </Box>
                      <Box sx={{flex: 1}}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {translate("finance.nfe.items.unitPrice")}
                        </Typography>
                        <Typography variant="body2">{formatCurrency(String(item.unitPrice))}</Typography>
                      </Box>
                      <Box sx={{flex: 1, textAlign: "right"}}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {translate("finance.nfe.items.totalPrice")}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(new Decimal(Number(item.quantity) || 0).times(Number(item.unitPrice) || 0).toString())}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{display: "flex", gap: 1, alignItems: "flex-end"}}>
                      <Box sx={{flex: 1}}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
                          {translate("finance.nfe.items.quantity")}
                        </Typography>
                        <FormDecimalInput fieldName={`items.${index}.quantity`} grid={false} errorAsIcon />
                      </Box>
                      <Box sx={{flex: 1}}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
                          {translate("finance.nfe.items.unitPrice")}
                        </Typography>
                        <FormCurrencyInput fieldName={`items.${index}.unitPrice`} grid={false} errorAsIcon />
                      </Box>
                      <Box sx={{textAlign: "right", pb: 1}}>
                        <Typography variant="body2" fontWeight={600} sx={{whiteSpace: "nowrap"}}>
                          {formatCurrency(new Decimal(Number(item.quantity) || 0).times(Number(item.unitPrice) || 0).toString())}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {nfe.errors.items && typeof nfe.errors.items.message === "string" && (
            <Typography variant="caption" color="error" sx={{mt: 1, display: "block"}}>
              {nfe.errors.items.message}
            </Typography>
          )}

          {items.length > 0 && (
            <Box sx={{display: "flex", justifyContent: "flex-end", mt: 1.5}}>
              <Typography variant="subtitle2" fontWeight={600}>
                {translate("finance.nfe.fields.totalAmount")}: {formatCurrency(totalAmount.toDecimalPlaces(2).toString())}
              </Typography>
            </Box>
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
            <Box sx={{display: "flex", gap: 1, mt: 3}}>
              <Button variant="contained" type="submit" form="nfe-drawer-form" fullWidth>
                {translate("global.confirm")}
              </Button>
            </Box>
          )}
        </form>
      </FormContextProvider>
    </GenericDrawer>
  );
}
