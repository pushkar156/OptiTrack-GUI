-- OptiTrack Inventory Control System
-- Seed Data Script (Phase 3: Data Population)

USE OptiTrack;

-- 1. Populating Categories
INSERT IGNORE INTO categories (cname, description) VALUES 
('Electronics', 'Laptops, peripherals, and communication devices'),
('Furniture', 'Office desks, chairs, and storage units'),
('Logistics', 'Packaging material, forklifts, and pallets');

-- 2. Populating Suppliers
INSERT IGNORE INTO suppliers (name, phone, address, email) VALUES 
('NexGen Tech', '9876543210', '123 Tech Park, Bangalore', 'supply@nexgen.com'),
('Global Furnishings', '8765432109', '45 Industrial Estate, Pune', 'orders@globalfurn.com'),
('SafePack Solutions', '7654321098', '78 Warehouse Road, Chennai', 'hello@safepack.com');

-- 3. Populating Products
INSERT IGNORE INTO products (pname, descrip, category_id) VALUES 
('Precision Laptop v2', 'Hexa-core, 16GB RAM, SSD', 1),
('ErgoChair Pro', 'High-back ergonomic office chair', 2),
('Smart Scanner', 'Barcode Scanners for Inventory', 1),
('Heavy-Duty Pallet', 'Standard shipping wooden pallets', 3),
('Industrial Forklift', '2-ton electric forklift', 3);

-- 4. Populating Warehouses
INSERT IGNORE INTO warehouses (w_name, location, capacity) VALUES 
('Mumbai Central Hub', 'Navi Mumbai, MH', 5000),
('Delhi North Wing', 'Gurugram, HR', 3000),
('Bangalore South Depot', 'Electronic City, KA', 4500);

-- 5. Populating Employees 
INSERT IGNORE INTO employees (id, ename, role, dob) VALUES 
(1, 'Rahul Sharma', 'Waehouse Manager', '1985-06-15');

INSERT IGNORE INTO employees (id, ename, role, dob, manager_id) VALUES 
(2, 'Sneha Patil', 'Inventory Staff', '1992-04-20', 1),
(3, 'Amit Verma', 'Logistics Associate', '1995-11-30', 1);

-- 6. Populating Customers
INSERT IGNORE INTO customers (name, email, address, contact, employee_id) VALUES 
('Acme Corp', 'contact@acme.com', 'Business Center, Mumbai', '022-123456', 2),
('Infinite Solutions', 'purchasing@infinite.in', 'Tech Hills, Bangalore', '080-987654', 3);

-- 7. Populating Initial Stock
CALL sp_restock_item(1, 1, 50);  
CALL sp_restock_item(2, 1, 100); 
CALL sp_restock_item(1, 3, 20);  
CALL sp_restock_item(4, 1, 500); 
CALL sp_restock_item(5, 2, 5);   
CALL sp_restock_item(3, 3, 8);   

-- 8. Testing with Orders
INSERT IGNORE INTO orders (id, product_id, warehouse_id, customer_id, quantity, price, status) 
VALUES (1, 1, 1, 1, 5, 45000.00, 'Shipped');

INSERT IGNORE INTO orders (id, product_id, warehouse_id, customer_id, quantity, price, status) 
VALUES (2, 2, 1, 2, 10, 8500.00, 'Pending');
