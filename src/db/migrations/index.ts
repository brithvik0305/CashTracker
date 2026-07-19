/**
 * Ordered schema migrations.
 *
 * Migrations are additive and run once, in version order, inside a transaction.
 * To evolve the schema, append a new entry with the next version number — never
 * edit an already-shipped migration, since it may have run on the user's device.
 *
 * M0 (v1): the migration runner and the `settings` singleton.
 * M1 (v2): accounts + the unified transactions ledger. Later milestones ALTER the
 * ledger to add entity links (categories, credit cards, lending, borrowing,
 * investments). The `type` CHECK already lists every planned transaction type so
 * that constraint never needs to change.
 *
 * Ledger convention: `transactions.amount` is the SIGNED effect (in paise) on the
 * linked bank `account_id` — positive raises the balance, negative lowers it. An
 * account's current balance is therefore `opening_balance + SUM(amount)`.
 */

export interface Migration {
  version: number;
  name: string;
  /** One or more SQL statements executed together. */
  up: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'init_settings',
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        id             INTEGER PRIMARY KEY CHECK (id = 1),
        theme          TEXT    NOT NULL DEFAULT 'system',   -- 'system' | 'light' | 'dark'
        currency       TEXT    NOT NULL DEFAULT 'INR',
        week_start_day INTEGER NOT NULL DEFAULT 3,          -- 0=Sun .. 3=Wed (financial week start)
        created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      INSERT OR IGNORE INTO settings (id) VALUES (1);
    `,
  },
  {
    version: 2,
    name: 'accounts_and_ledger',
    up: `
      CREATE TABLE IF NOT EXISTS accounts (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT    NOT NULL,
        type            TEXT    NOT NULL DEFAULT 'checking' CHECK (type IN ('checking', 'savings')),
        opening_balance INTEGER NOT NULL DEFAULT 0,   -- paise
        currency        TEXT    NOT NULL DEFAULT 'INR',
        is_archived     INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        type              TEXT    NOT NULL CHECK (type IN (
                            'income', 'expense', 'cc_purchase', 'cc_payment',
                            'lend', 'lend_return', 'borrow', 'borrow_repay',
                            'invest_add', 'invest_withdraw', 'transfer', 'adjustment'
                          )),
        amount            INTEGER NOT NULL,            -- signed paise effect on account_id
        account_id        INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        transfer_group_id TEXT,                        -- links the two legs of a transfer
        date              TEXT    NOT NULL,            -- 'YYYY-MM-DD' (local calendar date)
        notes             TEXT,
        created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_group   ON transactions(transfer_group_id);
    `,
  },
  {
    version: 3,
    name: 'categories_income_expense',
    up: `
      CREATE TABLE IF NOT EXISTS categories (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        icon        TEXT,
        color       TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      INSERT INTO categories (name, icon, sort_order) VALUES
        ('Food',   'fast-food-outline', 0),
        ('Travel', 'car-outline',       1),
        ('Stay',   'bed-outline',       2);

      -- Expenses link to a category; income (and later lending/borrowing) records a
      -- counterparty (client / person). Added as nullable columns to the ledger.
      ALTER TABLE transactions ADD COLUMN category_id INTEGER REFERENCES categories(id);
      ALTER TABLE transactions ADD COLUMN counterparty TEXT;

      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    `,
  },
  {
    version: 4,
    name: 'credit_cards',
    up: `
      CREATE TABLE IF NOT EXISTS credit_cards (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        name                TEXT    NOT NULL,
        credit_limit        INTEGER NOT NULL DEFAULT 0,   -- paise
        opening_outstanding INTEGER NOT NULL DEFAULT 0,   -- owed when the card was added (paise)
        statement_amount    INTEGER NOT NULL DEFAULT 0,   -- latest billed statement (paise)
        statement_date      TEXT,                         -- 'YYYY-MM-DD', nullable
        due_date            TEXT,                         -- 'YYYY-MM-DD', nullable
        is_archived         INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        sort_order          INTEGER NOT NULL DEFAULT 0,
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      -- A card purchase adds to outstanding (amount > 0, no bank account). A card
      -- payment reduces both the bank account and the card outstanding, and counts
      -- as spending. Both link here.
      ALTER TABLE transactions ADD COLUMN credit_card_id INTEGER REFERENCES credit_cards(id);

      CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(credit_card_id);
    `,
  },
  {
    version: 5,
    name: 'lending_and_borrowing',
    up: `
      -- Loan records hold only metadata (who + notes). Principal, repaid, and
      -- remaining amounts are derived from the linked ledger rows, so editing or
      -- deleting a transaction keeps the figures correct.
      CREATE TABLE IF NOT EXISTS lendings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        person      TEXT    NOT NULL,
        notes       TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS borrowings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        person      TEXT    NOT NULL,
        notes       TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      ALTER TABLE transactions ADD COLUMN lending_id   INTEGER REFERENCES lendings(id);
      ALTER TABLE transactions ADD COLUMN borrowing_id INTEGER REFERENCES borrowings(id);

      CREATE INDEX IF NOT EXISTS idx_transactions_lending   ON transactions(lending_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_borrowing ON transactions(borrowing_id);
    `,
  },
  {
    version: 6,
    name: 'investments',
    up: `
      -- Contributions and withdrawals live in the ledger; the record holds metadata
      -- plus an optional current market value. When current_value is NULL the
      -- amount actually invested is used instead.
      CREATE TABLE IF NOT EXISTS investments (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        type          TEXT    NOT NULL DEFAULT 'other'
                        CHECK (type IN ('mutual_fund', 'stock', 'gold', 'fd', 'other')),
        current_value INTEGER,
        notes         TEXT,
        is_archived   INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        sort_order    INTEGER NOT NULL DEFAULT 0,
        created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      ALTER TABLE transactions ADD COLUMN investment_id INTEGER REFERENCES investments(id);

      CREATE INDEX IF NOT EXISTS idx_transactions_investment ON transactions(investment_id);
    `,
  },
];
