-- Run this against the db-totem database (boxvisio_db) to add the
-- columns previously only present in db-tablets.

ALTER TABLE `product`
  ADD COLUMN IF NOT EXISTS `descripcion`    TEXT          NULL,
  ADD COLUMN IF NOT EXISTS `imgUrl`         VARCHAR(512)  NULL,
  ADD COLUMN IF NOT EXISTS `galleryImages`  TEXT          NULL,
  ADD COLUMN IF NOT EXISTS `instagramLink`  VARCHAR(512)  NULL,
  ADD COLUMN IF NOT EXISTS `color`          VARCHAR(128)  NULL;

ALTER TABLE `pedido`
  ADD COLUMN IF NOT EXISTS `urlReceta`             VARCHAR(512) NULL,
  ADD COLUMN IF NOT EXISTS `mp_preference_id`      VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_merchant_order_id`  VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_payment_id`         VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_payment_type`       VARCHAR(64)  NULL;
