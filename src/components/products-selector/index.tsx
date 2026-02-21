"use client";
import {Box, Chip, Grid, IconButton, Tooltip, Typography, useMediaQuery, useTheme, Alert} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {AsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {IntegerInput} from "@/src/components/form-fields/integer-input";
import {ImagePreview} from "@/src/components/image-preview";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Product} from "@/src/pages-content/stock/products/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {ProductsSelectorProps, ProductRowProps} from "./types";
import {buildName} from "@/src/pages-content/stock/products/utils";

export function ProductsSelector(props: ProductsSelectorProps) {
  const {value, onChange, disabled, incrementOnDuplicate, priceChangeText} = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const formatCurrency = useFormatCurrency();

  function handleAddProduct(product: Product | null) {
    if (!product) return;

    if (props.onSelect) {
      props.onSelect(product);
      return;
    }

    const cleanProduct: Product = {
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      description: product.description ?? null,
      image: product.image ?? null,
      stock: product.stock,
      displayLandingPage: product.displayLandingPage,
      active: product.active,
    };

    const existingItem = value.find((item) => item.product.id === cleanProduct.id);

    if (existingItem) {
      if (incrementOnDuplicate) {
        const newItems = value.map((item) => (item.product.id === cleanProduct.id ? {...item, quantity: item.quantity + 1} : item));
        onChange(newItems);
      }
      return;
    }

    onChange([...value, {product: cleanProduct, quantity: 1}]);
  }

  function handleQuantityChange(productId: string, quantity: number) {
    const updated = value.map((item) => (item.product.id === productId ? {...item, quantity} : item));
    onChange(updated);
  }

  function handleRemove(productId: string) {
    const filtered = value.filter((item) => item.product.id !== productId);
    onChange(filtered);
  }

  return (
    <Grid size={12}>
      <AsyncDropdown<Product>
        apiRoute="/api/product/paginated-list"
        uniqueKey="id"
        label="global.products"
        buildLabel={(option) => buildName(option)}
        renderOption={(option) => <DropdownOption image={option.image} name={buildName(option)} />}
        onChange={handleAddProduct}
        disabled={disabled}
      />

      {!props.onSelect && value.length > 0 && (
        <Box sx={{display: "flex", flexDirection: "column", gap: 1, marginTop: 2}}>
          {value.map((item) =>
            isMobile ? (
              <ProductRowMobile
                key={item.product.id}
                disabled={disabled}
                handleQuantityChange={handleQuantityChange}
                handleRemove={handleRemove}
                item={item}
                formatCurrency={formatCurrency}
                priceChangeText={priceChangeText}
              />
            ) : (
              <ProductRowDesktop
                key={item.product.id}
                disabled={disabled}
                handleQuantityChange={handleQuantityChange}
                handleRemove={handleRemove}
                item={item}
                formatCurrency={formatCurrency}
                priceChangeText={priceChangeText}
              />
            ),
          )}
        </Box>
      )}
    </Grid>
  );
}

function ProductRowMobile(props: ProductRowProps) {
  const {translate} = useTranslate();
  const theme = useTheme();
  const hasPriceChanged = props.item.unit_price && props.item.unit_price !== props.item.product.price.toString();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        padding: 1.5,
        borderRadius: 1,
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${hasPriceChanged ? theme.palette.warning.main : theme.palette.grey[300]}`,
      }}
    >
      <Box sx={{display: "flex", alignItems: "center", gap: 1.5, width: "100%"}}>
        <Box sx={{flex: 1}}>
          <IntegerInput
            value={props.item.quantity}
            onChange={(quantity) => props.handleQuantityChange(props.item.product.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.product.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{display: "flex", alignItems: "center", gap: 1, width: "100%"}}>
        {!props.item.product.active && <Chip label={translate("products.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.product.image} alt={props.item.product.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.product)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {props.formatCurrency(Number(props.item.product.price))}
        </Typography>
      </Box>
      {hasPriceChanged && (
        <Alert severity="warning" sx={{py: 0.5, alignItems: "center"}}>
          {props.priceChangeText} {props.formatCurrency(props.item.unit_price)}
        </Alert>
      )}
    </Box>
  );
}

function DropdownOption(props: {image?: string | null; name: string}) {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <ImagePreview url={props.image} alt={props.name} width={30} height={30} />
      <Typography variant="body2">{props.name}</Typography>
    </Box>
  );
}

function ProductRowDesktop(props: ProductRowProps) {
  const {translate} = useTranslate();
  const theme = useTheme();
  const hasPriceChanged = props.item.unit_price && props.item.unit_price !== props.item.product.price.toString();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: 1.5,
        borderRadius: 1,
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${hasPriceChanged ? theme.palette.warning.main : theme.palette.grey[300]}`,
      }}
    >
      <Box sx={{display: "flex", alignItems: "center", gap: 1.5, width: "100%"}}>
        <Box sx={{flex: 1}}>
          <IntegerInput
            value={props.item.quantity}
            onChange={(quantity) => props.handleQuantityChange(props.item.product.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.product.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{display: "flex", alignItems: "center", gap: 1, width: "100%"}}>
        {!props.item.product.active && <Chip label={translate("products.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.product.image} alt={props.item.product.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.product)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {props.formatCurrency(Number(props.item.product.price))}
        </Typography>
      </Box>
      {hasPriceChanged && (
        <Alert severity="warning" sx={{py: 0.5, alignItems: "center"}}>
          {props.priceChangeText} {props.formatCurrency(props.item.unit_price)}
        </Alert>
      )}
    </Box>
  );
}
