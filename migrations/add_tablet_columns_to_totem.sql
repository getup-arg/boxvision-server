-- Run this against the db-totem database (boxvisio_db) to create
-- tablet-specific tables that mirror the totem tables but are kept separate.

CREATE TABLE IF NOT EXISTS `adminuser_tablets` LIKE `adminuser`;

CREATE TABLE IF NOT EXISTS `usuarioAfiliado_tablets` LIKE `usuarioAfiliado`;

CREATE TABLE IF NOT EXISTS `rangograduacion_tablets` LIKE `rangograduacion`;

CREATE TABLE IF NOT EXISTS `product_tablets` LIKE `product`;
ALTER TABLE `product_tablets`
  ADD COLUMN IF NOT EXISTS `descripcion`    TEXT          NULL,
  ADD COLUMN IF NOT EXISTS `imgUrl`         VARCHAR(512)  NULL,
  ADD COLUMN IF NOT EXISTS `galleryImages`  TEXT          NULL,
  ADD COLUMN IF NOT EXISTS `instagramLink`  VARCHAR(512)  NULL,
  ADD COLUMN IF NOT EXISTS `color`          VARCHAR(128)  NULL;

CREATE TABLE IF NOT EXISTS `recetaGraduacion_tablets` LIKE `recetaGraduacion`;

CREATE TABLE IF NOT EXISTS `pedido_tablets` LIKE `pedido`;
ALTER TABLE `pedido_tablets`
  ADD COLUMN IF NOT EXISTS `urlReceta`             VARCHAR(512) NULL,
  ADD COLUMN IF NOT EXISTS `mp_preference_id`      VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_merchant_order_id`  VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_payment_id`         VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `mp_payment_type`       VARCHAR(64)  NULL;

CREATE TABLE IF NOT EXISTS `pedido_producto_tablets` LIKE `pedido-producto`;
