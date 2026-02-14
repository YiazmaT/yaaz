export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  id: string;
  name: string;
}

export interface ToggleCategoryActiveDto {
  id: string;
}
