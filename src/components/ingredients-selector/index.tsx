"use client";
import {Box, Chip, Grid, IconButton, Typography, useMediaQuery, useTheme} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {AsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {CurrencyInput} from "@/src/components/form-fields/currency-input";
import {DecimalInput} from "@/src/components/form-fields/decimal-input";
import {ImagePreview} from "@/src/components/image-preview";
import {CompositionIngredient, CompositionItem, IngredientsSelectorProps, IngredientRowProps} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";
import {useIngredientsConstants} from "@/src/pages-content/stock/ingredients/constants";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildName} from "@/src/pages-content/stock/ingredients/utils";

export function IngredientsSelector(props: IngredientsSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  function handleAddIngredient(ingredient: CompositionIngredient | null) {
    if (!ingredient) return;

    if (props.onSelect) {
      props.onSelect(ingredient);
      return;
    }

    const alreadyExists = props.value.some((item) => item.ingredient.id === ingredient.id);
    if (alreadyExists) return;

    const newItem: CompositionItem = {
      ingredient,
      quantity: "0",
    };
    props.onChange([...props.value, newItem]);
  }

  function handleQuantityChange(ingredientId: string, quantity: string) {
    const updated = props.value.map((item) => (item.ingredient.id === ingredientId ? {...item, quantity} : item));
    props.onChange(updated);
  }

  function handleCostChange(ingredientId: string, cost: string) {
    const updated = props.value.map((item) => (item.ingredient.id === ingredientId ? {...item, cost} : item));
    props.onChange(updated);
  }

  function handleRemove(ingredientId: string) {
    const filtered = props.value.filter((item) => item.ingredient.id !== ingredientId);
    props.onChange(filtered);
  }

  return (
    <Grid size={12}>
      <AsyncDropdown<CompositionIngredient>
        apiRoute="/api/ingredient/paginated-list"
        uniqueKey="id"
        label="global.ingredients"
        buildLabel={(option) => buildName(option)}
        renderOption={(option) => <DropdownOption image={option.image} name={buildName(option)} />}
        onChange={handleAddIngredient}
        disabled={props.disabled}
      />

      {!props.onSelect && props.value.length > 0 && (
        <Box sx={{display: "flex", flexDirection: "column", gap: 1, marginTop: 2}}>
          {props.value.map((item) =>
            isMobile ? (
              <IngredientRowMobile
                key={item.ingredient?.id}
                disabled={props.disabled}
                handleQuantityChange={handleQuantityChange}
                handleCostChange={handleCostChange}
                handleRemove={handleRemove}
                item={item}
                showCostField={props.showCostField}
              />
            ) : (
              <IngredientRowDesktop
                key={item.ingredient?.id}
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

function IngredientRowMobile(props: IngredientRowProps) {
  const {translate} = useTranslate();
  const {unitOfMeasures} = useIngredientsConstants();
  const theme = useTheme();

  return (
    <Box
      key={props.item.ingredient.id}
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
            onChange={(quantity) => props.handleQuantityChange(props.item.ingredient.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {props.showCostField && props.handleCostChange && (
          <Box sx={{flex: 1}}>
            <CurrencyInput
              value={props.item.cost || "0"}
              onChange={(cost) => props.handleCostChange!(props.item.ingredient.id, cost)}
              disabled={props.disabled}
              label="ingredients.fields.cost"
              fullWidth
            />
          </Box>
        )}
        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.ingredient.id)} disabled={props.disabled} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{...flexGenerator("r.center"), gap: 1, width: "100%"}}>
        {props.item.ingredient.active === false && <Chip label={translate("ingredients.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.ingredient.image} alt={props.item.ingredient.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.ingredient)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unitOfMeasures[props.item.ingredient.unit_of_measure as keyof typeof unitOfMeasures].label}
        </Typography>
      </Box>
    </Box>
  );
}

function IngredientRowDesktop(props: IngredientRowProps) {
  const {translate} = useTranslate();
  const {unitOfMeasures} = useIngredientsConstants();
  const theme = useTheme();

  return (
    <Box
      key={props.item.ingredient.id}
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
            onChange={(quantity) => props.handleQuantityChange(props.item.ingredient.id, quantity)}
            disabled={props.disabled}
            label="products.fields.quantity"
            fullWidth
          />
        </Box>
        {props.showCostField && props.handleCostChange && (
          <Box sx={{flex: 1}}>
            <CurrencyInput
              value={props.item.cost || "0"}
              onChange={(cost) => props.handleCostChange!(props.item.ingredient.id, cost)}
              disabled={props.disabled}
              label="ingredients.fields.cost"
              fullWidth
            />
          </Box>
        )}
        {!props.disabled && (
          <IconButton size="small" onClick={() => props.handleRemove(props.item.ingredient.id)} disabled={props.disabled} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{...flexGenerator("r.center"), gap: 1, width: "100%"}}>
        {props.item.ingredient.active === false && <Chip label={translate("ingredients.inactive")} size="small" color="error" />}
        <ImagePreview url={props.item.ingredient.image} alt={props.item.ingredient.name} width={40} height={40} borderRadius={1} />
        <Typography variant="body2" fontWeight={600}>
          {buildName(props.item.ingredient)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unitOfMeasures[props.item.ingredient.unit_of_measure as keyof typeof unitOfMeasures].label}
        </Typography>
      </Box>
    </Box>
  );
}
