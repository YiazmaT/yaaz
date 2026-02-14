import {useCategories} from "../use-categories";

export interface CategoryFormProps {
  categories: ReturnType<typeof useCategories>;
}
