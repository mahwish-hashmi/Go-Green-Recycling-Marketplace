SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE cart_item;
TRUNCATE TABLE products;
TRUNCATE TABLE users;

INSERT INTO users (id, address, email, name, password, phone, username, role) VALUES
(1, '123 Main Street, New York', 'buyer@example.com', 'John Buyer', '$2a$10$Erpu59oI2N.GJ4QVFB8fgeKRh1qPS.TbFaXI3itO4RdCbuohqBSlW', '9999999991', 'buyer1', 'ROLE_BUYER'),
(2, '456 Market Ave, San Francisco', 'seller@example.com', 'Jane Seller', '$2a$10$nmuNNoNrR8W/c.nwE0G5iOiK4ZnPMLNPm5gP1rh0P4DuUEnYCClNK', '9999999992', 'seller1', 'ROLE_SELLER'),
(3, '789 Green Road, Austin', 'jendoe@email.com', 'Jen Doe', '$2a$10$9tsdZ0xSjTz0AiIU18EPIOeC0EFuSI3aGI.hjz5Im2/JekWufFMUW', '9999999993', 'jendoe', 'ROLE_BUYER');

INSERT INTO products (id, added_on, description, name, price) VALUES
(1, NOW(), 'Eco-friendly bamboo water bottle, keeps drinks cold for 24 hours', 'Bamboo Water Bottle', 18.99),
(2, NOW(), 'Reusable organic cotton shopping bag, strong and washable', 'Organic Cotton Bag', 9.99),
(3, NOW(), 'Solar-powered phone charger, 10000 mAh, USB-C and USB-A ports', 'Solar Phone Charger', 49.99),
(4, NOW(), 'Biodegradable compostable plates pack of 50, perfect for events', 'Compostable Plates', 14.99),
(5, NOW(), 'Stainless steel reusable straws set of 8 with cleaning brush', 'Steel Straw Set', 11.99),
(6, NOW(), 'Natural beeswax food wraps, replaces plastic cling film', 'Beeswax Food Wraps', 16.99);

INSERT INTO cart_item (added_on, quantity, product_id, user_id) VALUES
(NOW(), 2, 1, 1),
(NOW(), 1, 3, 1),
(NOW(), 3, 5, 1);

SET FOREIGN_KEY_CHECKS = 1;