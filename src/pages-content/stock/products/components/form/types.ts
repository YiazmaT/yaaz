import {useProducts} from "../../use-products";

export interface FormProps {
  products: ReturnType<typeof useProducts>;
  imageSize?: number;
}
