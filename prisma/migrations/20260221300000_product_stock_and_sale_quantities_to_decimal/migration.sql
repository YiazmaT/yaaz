-- Change product stock fields from Int to Decimal
ALTER TABLE data.product
  ALTER COLUMN stock TYPE DECIMAL USING stock::DECIMAL,
  ALTER COLUMN min_stock TYPE DECIMAL USING min_stock::DECIMAL;

-- Change product_stock_change fields from Int to Decimal
ALTER TABLE data.product_stock_change
  ALTER COLUMN previous_stock TYPE DECIMAL USING previous_stock::DECIMAL,
  ALTER COLUMN new_stock TYPE DECIMAL USING new_stock::DECIMAL;

-- Change sale_item quantity from Int to Decimal
ALTER TABLE data.sale_item
  ALTER COLUMN quantity TYPE DECIMAL USING quantity::DECIMAL;

-- Change sale_package quantity from Int to Decimal
ALTER TABLE data.sale_package
  ALTER COLUMN quantity TYPE DECIMAL USING quantity::DECIMAL;
