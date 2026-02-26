-- DropIndex
DROP INDEX `menu_items_category_id_fkey` ON `menu_items`;

-- DropIndex
DROP INDEX `order_items_menu_item_id_fkey` ON `order_items`;

-- DropIndex
DROP INDEX `order_items_order_id_fkey` ON `order_items`;

-- DropIndex
DROP INDEX `order_status_logs_by_user_id_fkey` ON `order_status_logs`;

-- DropIndex
DROP INDEX `order_status_logs_order_id_fkey` ON `order_status_logs`;

-- DropIndex
DROP INDEX `orders_customer_user_id_fkey` ON `orders`;

-- DropIndex
DROP INDEX `payments_order_id_fkey` ON `payments`;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_user_id_fkey` FOREIGN KEY (`customer_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_logs` ADD CONSTRAINT `order_status_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_logs` ADD CONSTRAINT `order_status_logs_by_user_id_fkey` FOREIGN KEY (`by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
