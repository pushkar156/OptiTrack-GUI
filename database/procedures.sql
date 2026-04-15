-- =============================================
-- OPTITRACK ADVANCED RELATIONAL LOGIC (MASTER)
-- This file contains all Procedures, Triggers, and Views
-- =============================================

USE OptiTrack;

-- ---------------------------------------------------------
-- PART 1: SYSTEM VIEWS (Real-time Analytics)
-- ---------------------------------------------------------

-- 1. View for Low Stock Monitoring
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

-- 2. View for Complete Order Audit Trail
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

-- 3. View for Employee Dynamic Age Calculation
CREATE OR REPLACE VIEW view_employee_details AS
SELECT 
    id, ename, role, dob, manager_id,
    TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age
FROM employees;


-- ---------------------------------------------------------
-- PART 2: STORED PROCEDURES (Control Logic)
-- ---------------------------------------------------------

DELIMITER //

-- 1. Restock Procedure (Handles Inbound Logistics)
CREATE PROCEDURE sp_restock_item(IN p_id INT, IN w_id INT, IN qty INT)
BEGIN
    INSERT INTO product_warehouses (product_id, warehouse_id, stock)
    VALUES (p_id, w_id, qty)
    ON DUPLICATE KEY UPDATE stock = stock + qty;
END //

-- 2. Audit Cursor Procedure (Advanced Batch Processing)
-- Scans all warehouses and logs critical alerts per row
CREATE PROCEDURE sp_run_system_audit()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE p_id INT;
    DECLARE p_name VARCHAR(100);
    DECLARE current_stock INT;
    
    DECLARE low_stock_cursor CURSOR FOR 
        SELECT p.id, p.pname, pw.stock 
        FROM products p 
        JOIN product_warehouses pw ON p.id = pw.product_id 
        WHERE pw.stock < 10;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN low_stock_cursor;
    
    read_loop: LOOP
        FETCH low_stock_cursor INTO p_id, p_name, current_stock;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO audit_logs (action_type, entity_id, details)
        VALUES ('AUTO_ALERT', p_id, CONCAT('System Audit: Critical Stock (', current_stock, ') of ', p_name));
    END LOOP;
    
    CLOSE low_stock_cursor;
    
    SELECT 'SYSTEM_AUDIT_SUCCESS' AS Status;
END //

DELIMITER ;


-- ---------------------------------------------------------
-- PART 3: TRIGGERS (Automated Data Integrity)
-- ---------------------------------------------------------

DELIMITER //

-- Auto-update inventory when a shipment (order) is recorded
DROP TRIGGER IF EXISTS tr_update_stock_on_order//
CREATE TRIGGER tr_update_stock_on_order
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE product_warehouses
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
END //

DELIMITER ;
