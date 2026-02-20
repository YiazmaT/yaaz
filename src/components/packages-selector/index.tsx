"use client";
import {Box, Chip, Grid, IconButton, Typography, useMediaQuery, useTheme} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {AsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {CurrencyInput} from "@/src/components/form-fields/currency-input";
import {DecimalInput} from "@/src/components/form-fields/decimal-input";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildName} from "@/src/pages-content/packages/utils";
import {CompositionPackage, PackageCompositionItem, PackagesSelectorProps, PackageRowProps} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";

export function PackagesSelector(props: PackagesSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  function handleAddPackage(pkg: CompositionPackage | null) {
    if (!pkg) return;

    if (props.onSelect) {
      props.onSelect(pkg);
      return;
    }

    const alreadyExists = props.value.some((item) => item.package.id === pkg.id);
    if (alreadyExists) return;

    const newItem: PackageCompositionItem = {
      package: pkg,
      quantity: "1",
    };
    props.onChange([...props.value, newItem]);
  }

  function handleQuantityChange(packageId: string, quantity: string) {
    const updated = props.value.map((item) => (item.package.id === packageId ? {...item, quantity} : item));
    props.onChange(updated);
  }

  function handleCostChange(packageId: string, cost: string) {
    const updated = props.value.map((item) => (item.package.id === packageId ? {...item, cost} : item));
    props.onChange(updated);
  }

  function handleRemove(packageId: string) {
    const filtered = props.value.filter((item) => item.package.id !== packageId);
    props.onChange(filtered);
  }

  return (
    <Grid size={12}>
      <AsyncDropdown<CompositionPackage>
        apiRoute="/api/package/paginated-list"
        uniqueKey="id"
        label="global.packages"
        buildLabel={(option) => buildName(option)}
        renderOption={(option) => <DropdownOption image={option.image} name={buildName(option)} />}
        onChange={handleAddPackage}
        disabled={props.disabled}
        extraQueryParams={props.typeFilter ? `type=${props.typeFilter}` : undefined}
      />

      {!props.onSelect && props.value.length > 0 && (
        <Box sx={{display: "flex", flexDirection: "column", gap: 1, marginTop: 2}}>
          {props.value.map((item) =>
            isMobile ? (
              <PackageRowMobile
                key={item.package?.id}
                disabled={props.disabled}
                handleQuantityChange={handleQuantityChange}
                handleCostChange={handleCostChange}
                handleRemove={handleRemove}
                item={item}
                showCostField={props.showCostField}
              />
            ) : (
              <PackageRowDesktop
                key={item.package?.id}
                disabled={props.disabled}
                handleQuantityChange={handleQuantityChange}
                handleCostChange={handleCostChange}
                handleRemove={handleRemove}
                item={item}
                showCostField={props.showCostField}
              />
            ),
          )}
        </Box>
      )}
    </Grid>
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

function PackageRowMobile(props: PackageRowProps) {
  const {translate} = useTranslate();
  const theme = useTheme();

  return (
    <Box
      key={props.item.package.id}
      sx={{
        ...flexGenerator("c.flex-start"),
        gap: 1.5,
        padding: 1.5,
        borderRadius: 1,
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Box sx={{...flexGenerator("r.center"), gap: 1.5, width: "100%"}}>
        <Box sx={{flex: 1}}>
          <DecimalInput
            value={props.item.quantity}
            onChange={(quantity) => props.handleQuantityChange(props.item.package.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {props.showCostField && props.handleCostChange && (
          <Box sx={{flex: 1}}>
            <CurrencyInput
              value={props.item.cost || "0"}
              onChange={(cost) => props.handleCostChange!(props.item.package.id, cost)}
              disabled={props.disabled}
              label="packages.fields.cost"
              fullWidth
            />
          </Box>
        )}
        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.package.id)} disabled={props.disabled} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{...flexGenerator("r.center"), gap: 1, width: "100%"}}>
        {props.item.package.active === false && <Chip label={translate("packages.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.package.image} alt={props.item.package.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.package)}
        </Typography>
      </Box>
    </Box>
  );
}

function PackageRowDesktop(props: PackageRowProps) {
  const {translate} = useTranslate();
  const theme = useTheme();

  return (
    <Box
      key={props.item.package.id}
      sx={{
        ...flexGenerator("c.flex-start"),
        gap: 1.5,
        padding: 1.5,
        borderRadius: 1,
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Box sx={{...flexGenerator("r.center"), gap: 1.5, width: "100%"}}>
        <Box sx={{flex: 1}}>
          <DecimalInput
            value={props.item.quantity}
            onChange={(quantity) => props.handleQuantityChange(props.item.package.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {props.showCostField && props.handleCostChange && (
          <Box sx={{flex: 1}}>
            <CurrencyInput
              value={props.item.cost || "0"}
              onChange={(cost) => props.handleCostChange!(props.item.package.id, cost)}
              disabled={props.disabled}
              label="packages.fields.cost"
              fullWidth
            />
          </Box>
        )}

        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.package.id)} disabled={props.disabled} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{...flexGenerator("r.center"), gap: 1, width: "100%"}}>
        {props.item.package.active === false && <Chip label={translate("packages.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.package.image} alt={props.item.package.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.package)}
        </Typography>
      </Box>
    </Box>
  );
}
