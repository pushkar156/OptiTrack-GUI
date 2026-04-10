-- OptiTrack Inventory Control System
-- Advanced Database Objects (Phase 2: Triggers, Views & Procedures)

USE OptiTrack;

DELIMITER //

-- 1. TRIGGER: Update Inventory on New Order
DROP TRIGGER IF EXISTS tr_update_stock_on_order;
CREATE TRIGGER tr_update_stock_on_order
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    SELECT stock INTO current_stock 
    FROM product_warehouses 
    WHERE product_id = NEW.product_id 
      AND warehouse_id = NEW.warehouse_id;
    
    IF current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Product not found in the specified warehouse.';
    ELSEIF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Insufficient stock for this order.';
    ELSE
        UPDATE product_warehouses 
        SET stock = stock - NEW.quantity 
        WHERE product_id = NEW.product_id 
          AND warehouse_id = NEW.warehouse_id;
    END IF;
END;
//

DELIMITER ;

-- 2. VIEW: Low Stock Alerts
CREATE OR REPLACE VIEW view_low_stock_alerts AS
SELECT 
    p.id AS product_id,
    p.pname AS product_name,
    w.w_name AS warehouse_name,
    pw.stock AS items_remaining
FROM products p
JOIN product_warehouses pw ON p.id = pw.product_id
JOIN warehouses w ON pw.warehouse_id = w.id
WHERE pw.stock <= 10;

-- 3. VIEW: Complete Order Summary
CREATE OR REPLACE VIEW view_order_summary AS
SELECT 
    o.id AS order_id,
    o.order_date,
    c.name AS customer_name,
    p.pname AS product_name,
    o.quantity,
    o.price,
    (o.quantity * o.price) AS total_bill,
    w.w_name AS fulfilled_from,
    o.status
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
JOIN warehouses w ON o.warehouse_id = w.id;

-- 4. PROCEDURE: Standardized Restocking
DELIMITER //

CREATE PROCEDURE sp_restock_item(
    IN p_id INT, 
    IN w_id INT, 
    IN qty INT
)
BEGIN
    INSERT INTO product_warehouses (product_id, warehouse_id, stock)
    VALUES (p_id, w_id, qty)
    ON DUPLICATE KEY UPDATE stock = stock + qty;
END;
//

DELIMITER ;
