-- Add addresses, promotions, restaurant settings, and payment updates

CREATE TABLE `addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `recipient_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `line1` VARCHAR(191) NOT NULL,
  `note` VARCHAR(191) NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `addresses_user_id_fkey`(`user_id`),
  CONSTRAINT `addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `orders`
  ADD COLUMN `address_id` INT NULL,
  ADD INDEX `orders_address_id_fkey`(`address_id`),
  ADD CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `payments`
  MODIFY `method` ENUM('MOCK','QR_CODE','CASH') NOT NULL DEFAULT 'MOCK',
  ADD COLUMN `slip_image_url` TEXT NULL;

ALTER TABLE `menu_items`
  MODIFY `image_url` TEXT NULL;

CREATE TABLE `promotions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NULL,
  `image_url` TEXT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `restaurant_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `open_hours` VARCHAR(191) NOT NULL DEFAULT '09:00 - 21:00',
  `qr_image_url` TEXT NULL,
  `accept_cash` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `restaurant_settings` (`id`, `delivery_fee`, `open_hours`, `accept_cash`) VALUES (1, 0, '09:00 - 21:00', true);
