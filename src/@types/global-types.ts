import {Control, FieldErrors} from 'react-hook-form';

export type IFormScreenTypes = 'create' | 'edit' | 'details';

export interface FormScreenProps {
  type: IFormScreenTypes;
  title?: string;
  id?: number | string;
}

export interface FormInputProps {
  control?: Control<any>;
  errors?: FieldErrors<any>;
  fieldName: string;
  grid?: boolean;
  size?: number;
  additionalOnChange?: (v: string) => void;
}

export interface JwtContent {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
}

export interface TableConfigProps<T> {
  onView: (row: T) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}
