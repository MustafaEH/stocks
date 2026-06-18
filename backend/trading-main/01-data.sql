-- ============================================
-- Initial Data Population
-- ============================================

-- 1. Insert Users
INSERT INTO users (full_name, email, username, password_hash) 
VALUES 
('Bob Trader', 'bob@example.com', 'trader_bob', 'hashed_password_bob'),
('Alice Investor', 'alice@example.com', 'investor_alice', 'hashed_password_alice'),
('Mustafa Ehab', 'mustafa1@example.com', 'mustafa1', 'hashed_password_mustafa')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Accounts (Linked to users)
INSERT INTO accounts (user_id, balance)
SELECT id, 10000.00 FROM users WHERE username = 'trader_bob'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO accounts (user_id, balance)
SELECT id, 5000.00 FROM users WHERE username = 'investor_alice'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO accounts (user_id, balance)
SELECT id, 25000.00 FROM users WHERE username = 'mustafa1'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Stocks
INSERT INTO stocks (name, symbol, price)
VALUES 
('Apple Inc.', 'AAPL', 185.50),
('Tesla Inc.', 'TSLA', 170.20),
('Nvidia Corp.', 'NVDA', 900.15),
('Microsoft Corp.', 'MSFT', 420.75),
('Amazon.com Inc.', 'AMZN', 180.45)
ON CONFLICT (symbol) DO NOTHING;

-- 4. Insert Sample Portfolio Data
INSERT INTO portfolio (user_id, stock_symbol, quantity, avg_buy_price)
SELECT 
    (SELECT id FROM users WHERE username = 'trader_bob'),
    'AAPL',
    100,
    150.00
ON CONFLICT (user_id, stock_symbol) DO NOTHING;

INSERT INTO portfolio (user_id, stock_symbol, quantity, avg_buy_price)
SELECT 
    (SELECT id FROM users WHERE username = 'investor_alice'),
    'NVDA',
    50,
    850.00
ON CONFLICT (user_id, stock_symbol) DO NOTHING;

-- 5. Insert Sample Transaction History
INSERT INTO transactions (user_id, stock_symbol, transaction_type, quantity, price, total_amount)
SELECT
    (SELECT id FROM users WHERE username = 'trader_bob'),
    'AAPL',
    'BUY',
    100,
    150.00,
    15000.00
ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, stock_symbol, transaction_type, quantity, price, total_amount)
SELECT
    (SELECT id FROM users WHERE username = 'investor_alice'),
    'NVDA',
    'BUY',
    50,
    850.00,
    42500.00
ON CONFLICT DO NOTHING;
