CREATE TABLE portfolio (
    user_id INT NOT NULL,
    stock_symbol TEXT NOT NULL,
    quantity INT NOT NULL,
    avg_buy_price NUMERIC(15,2) NOT NULL,

    CONSTRAINT pk_portfolio PRIMARY KEY (user_id, stock_symbol),

    CONSTRAINT fk_portfolio_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT positive_quantity
        CHECK (quantity > 0),

    CONSTRAINT positive_avg_price
        CHECK (avg_buy_price > 0)
);