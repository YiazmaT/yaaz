"use client";
import {useState} from "react";
import {FormControlLabel, Switch} from "@mui/material";
import {FilterDrawer} from "@/src/components/filter-drawer";
import {useTranslate} from "@/src/contexts/translation-context";
import {UnityOfMeasureFiltersProps} from "./types";

export function UnityOfMeasureFiltersComponent(props: UnityOfMeasureFiltersProps) {
  const [showInactives, setShowInactives] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const {translate} = useTranslate();

  function handleApply() {
    setFiltersApplied(showInactives);
    props.onFilterChange({showInactives});
  }

  function handleClear() {
    setShowInactives(false);
    setFiltersApplied(false);
    props.onFilterChange({});
  }

  return (
    <FilterDrawer
      hasActiveFilters={filtersApplied}
      onClear={handleClear}
      onApply={handleApply}
      showActionButtons
    >
      <FormControlLabel
        control={<Switch checked={showInactives} onChange={(e) => setShowInactives(e.target.checked)} />}
        label={translate("unityOfMeasure.filters.showInactives")}
      />
    </FilterDrawer>
  );
}
