-- 1. Create Users (with all required columns)
INSERT INTO users (full_name, email, username, password_hash) 
VALUES 
('Bob Trader', 'bob@example.com', 'trader_bob', 'hash_1234'), 
('Alice Investor', 'alice@example.com', 'investor_alice', 'hash_5678');

-- 2. Create Accounts (Linked 1:1)
-- ID 1 = Bob, ID 2 = Alice
INSERT INTO accounts (user_id, balance) 
VALUES 
(5, 10000.00), 
(6, 5000.00);

-- 3. Add Stocks
INSERT INTO stocks (name, symbol, price) 
VALUES 
('Apple Inc.', 'AAPL', 185.50),
('Tesla Inc.', 'TSLA', 170.20),
('Nvidia Corp.', 'NVDA', 900.15);