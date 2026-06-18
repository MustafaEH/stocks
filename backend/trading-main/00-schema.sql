-- ============================================
-- Schema Creation - Tables & Structure
-- ============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- 3. Stocks Table
CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
    user_id INT NOT NULL,
    stock_symbol TEXT NOT NULL,
    quantity INT NOT NULL,
    avg_buy_price NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_portfolio PRIMARY KEY (user_id, stock_symbol),
    CONSTRAINT fk_portfolio_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT positive_quantity
        CHECK (quantity > 0),
    CONSTRAINT positive_avg_price
        CHECK (avg_buy_price > 0)
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL, -- 'BUY' or 'SELL'
    quantity INT NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT valid_transaction_type
        CHECK (transaction_type IN ('BUY', 'SELL')),
    CONSTRAINT positive_quantity_tx
        CHECK (quantity > 0),
    CONSTRAINT positive_price_tx
        CHECK (price > 0)
);

-- 6. Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
