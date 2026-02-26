-- Generated manually for initial schema

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(191) NOT NULL,
  `role` ENUM('CUSTOMER', 'MERCHANT_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `menu_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `menu_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` TEXT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT true,
  `is_recommended` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `menu_items_category_id_fkey`(`category_id`),
  CONSTRAINT `menu_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(191) NOT NULL,
  `customer_user_id` INT NOT NULL,
  `status` ENUM('PENDING_PAYMENT','PAID','CONFIRMED','COOKING','READY','COMPLETED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `customer_name_snapshot` VARCHAR(191) NOT NULL,
  `customer_phone_snapshot` VARCHAR(191) NULL,
  `address_snapshot` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `orders_order_no_key`(`order_no`),
  INDEX `orders_customer_user_id_fkey`(`customer_user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `orders_customer_user_id_fkey` FOREIGN KEY (`customer_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `menu_item_id` INT NOT NULL,
  `name_snapshot` VARCHAR(191) NOT NULL,
  `price_snapshot` DECIMAL(10,2) NOT NULL,
  `qty` INT NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `order_items_order_id_fkey`(`order_id`),
  INDEX `order_items_menu_item_id_fkey`(`menu_item_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `method` ENUM('MOCK') NOT NULL DEFAULT 'MOCK',
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME(3) NULL,
  `ref_code` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  INDEX `payments_order_id_fkey`(`order_id`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `order_status_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `status` ENUM('PENDING_PAYMENT','PAID','CONFIRMED','COOKING','READY','COMPLETED','REJECTED','CANCELLED') NOT NULL,
  `by_role` ENUM('CUSTOMER', 'MERCHANT_ADMIN') NOT NULL,
  `by_user_id` INT NULL,
  `note` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `order_status_logs_order_id_fkey`(`order_id`),
  INDEX `order_status_logs_by_user_id_fkey`(`by_user_id`),
  CONSTRAINT `order_status_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_status_logs_by_user_id_fkey` FOREIGN KEY (`by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
