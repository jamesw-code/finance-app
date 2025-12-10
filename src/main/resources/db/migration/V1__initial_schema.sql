-- Flyway initial schema for finance domain
CREATE TABLE IF NOT EXISTS businesses (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50),
    CONSTRAINT fk_accounts_business FOREIGN KEY (business_id) REFERENCES businesses (id)
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id BIGINT,
    kind VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_categories_business FOREIGN KEY (business_id) REFERENCES businesses (id),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) REFERENCES categories (id)
);
CREATE INDEX idx_categories_business ON categories (business_id);
CREATE INDEX idx_categories_parent ON categories (parent_category_id);

CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendors_business FOREIGN KEY (business_id) REFERENCES businesses (id)
);
CREATE INDEX idx_vendors_business ON vendors (business_id);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    payee VARCHAR(255) NOT NULL,
    memo TEXT,
    posted_at DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    vendor_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_business FOREIGN KEY (business_id) REFERENCES businesses (id),
    CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts (id),
    CONSTRAINT fk_transactions_vendor FOREIGN KEY (vendor_id) REFERENCES vendors (id)
);
CREATE INDEX idx_transactions_business ON transactions (business_id);
CREATE INDEX idx_transactions_account ON transactions (account_id);
CREATE INDEX idx_transactions_vendor ON transactions (vendor_id);
CREATE INDEX idx_transactions_posted_at ON transactions (posted_at);

CREATE TABLE IF NOT EXISTS transaction_splits (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    memo TEXT,
    CONSTRAINT fk_splits_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id),
    CONSTRAINT fk_splits_category FOREIGN KEY (category_id) REFERENCES categories (id)
);
CREATE INDEX idx_splits_transaction ON transaction_splits (transaction_id);
CREATE INDEX idx_splits_category ON transaction_splits (category_id);
