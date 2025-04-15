---
**Product Requirements Document: Virtual Stock Trading Platform Backend**
**Version:** 1.0
**Date:** 2025-04-12
**Status:** Draft

**1. Introduction**
This document outlines the requirements for the backend system of a Virtual Stock Trading Platform. The platform aims to provide users with a realistic simulation of stock market trading **on Indian exchanges (NSE/BSE)** using virtual currency. Users will be able to manage portfolios, place orders *during market hours*, track stocks through watchlists, and receive relevant notifications. The backend will be built using Python and will serve as the core engine powering the platform's functionalities, exposing APIs for consumption by frontend applications (web, mobile, etc.). **All operations and timestamps will adhere to Indian Standard Time (IST, UTC+05:30).**

**2. Goals and Objectives**
* Provide a robust and reliable backend infrastructure for virtual stock trading **focused on Indian markets (NSE/BSE)**.
* Simulate real-world trading scenarios including market and limit orders, **respecting official market timings**. 
* Enable users to manage multiple virtual portfolios and watchlists effectively.
* Implement a secure user authentication and authorization system.
* Deliver timely notifications regarding trading activities and potentially market events.
* Build a scalable and maintainable system capable of handling a growing user base.
* Provide well-documented APIs for frontend integration.
* Ensure all time-based operations reflect Indian Standard Time (IST).
* Restrict trading activities to official market hours obtained via an external source.

**3. Scope**

**3.1. In Scope:**
* User registration, authentication (login/logout), and profile management (basic).
* Secure password handling.
* Management of virtual currency balances per user.
* Retrieval of stock information (details, price - potentially near-real-time or delayed) via Moneycontrol API.
* Fetching and utilization of market open/close times via Groww Market Status API.
* Implementation of Market and Limit orders (Buy/Sell), **allowed only during market hours.**
* Order matching simulation engine (based on available price data).
* Portfolio creation, management, and performance tracking (basic metrics like P/L, value).
* Holding management within portfolios.
* Watchlist creation and management (adding/removing stocks).
* Notification system for order status updates.
* RESTful API design and implementation.
* Database design and management.
* Basic admin functionalities (e.g., view users).
* Consistent handling of all timestamps in Indian Standard Time (IST).

**3.2. Out of Scope:**
* Frontend user interface (UI/UX) development.
* Real-money trading and brokerage integration.
* Complex order types (e.g., stop-loss, trailing stop, options, futures).
* Real-time, tick-by-tick market data streaming (will rely on periodic fetching or simulated data).
* Advanced financial analysis tools and charting capabilities (backend provides data, frontend renders).
* Social trading features (following users, sharing portfolios).
* Dividend handling, stock splits, corporate actions simulation (can be added later).
* Payment gateway integration (platform uses virtual currency only).
* Direct market news analysis or sentiment scoring (will store data if available from source).
* Allowing order placement or simulated execution outside of official Indian market hours.
* Handling of pre-open or post-market sessions.

**4. Users / Target Audience**
* **End Users:** Individuals interested in learning Indian stock market trading, testing strategies, or participating in simulated trading competitions without financial risk.
* **Administrators:** Internal team members responsible for monitoring system health, managing users (if needed), and potentially overseeing platform operations.
* **Frontend Developers:** Consumers of the backend APIs to build user-facing applications.

**5. Core Requirements (Functional)**

**5.1. User Management**
* **FR1.1:** System must allow new users to register with a unique username, a valid email address, and a secure password.
* **FR1.2:** Passwords must be securely hashed before storage (e.g., using bcrypt).
* **FR1.3:** Registered users must be able to log in using their username and password.
* **FR1.4:** System must provide a mechanism for authenticating subsequent API requests (e.g., JWT).
* **FR1.5:** Each user must be assigned an initial virtual currency balance upon registration.
* **FR1.6:** Users should be able to view their basic profile information (username, email, balance).
* **FR1.7:** System should support an `is_admin` flag for administrative privileges.

**5.2. Stock Information**
* FR2.1: System must fetch stock information, including price data, using the Moneycontrol Price API (https://priceapi.moneycontrol.com/pricefeed/{exchange}/equitycash/{mcid}). The system identifies unique listings by the combination of symbol and exchange. The {mcid} required for the API call is stored in the stock_info record associated with that specific (symbol, exchange) listing. 
* FR2.2: System must provide an API endpoint to retrieve a list of available stock listings stored in the local stocks database table.
* FR2.3: System must provide an API endpoint to retrieve detailed information for a specific stock listing, identified by its symbol and exchange. This involves retrieving core data from the stocks table and dynamic market data from the associated stock_info record. Returned fields should include relevant details like symbol, exchange, name, current_price, pricechange, etc.
* FR2.4: System must provide an API endpoint to retrieve historical OHLCV (Open, High, Low, Close, Volume) data for a specific stock listing (symbol) on the **NSE exchange only**, using the Moneycontrol Tech Charts API. The API should support different time resolutions (e.g., 1min, 5min, 1D).
* FR2.5: System should store related news articles for stocks (potentially linked to specific listings via news_stocks). Requires a suitable data source.

**5.3. Market Status & Trends**
* **FR_Market.1:** System must periodically fetch market timing information (market open and close times for upcoming/current dates) from the Groww Market Timing API (`GET https://groww.in/v1/api/stocks_data/v1/market/market_timing?null`).
* **FR_Market.2:** Fetched market timing data must be cached locally (e.g., daily) to minimize external API calls.
* **FR_Market.3:** System must provide a mechanism (internal check or API endpoint) to determine if the Indian stock market is currently open based on the current IST date and time and the fetched/cached market timings.
* **FR_Market.4:** If the external market timing API is unavailable or fails, the system must prevent placing new orders and log an appropriate error. Trading should default to 'closed' in case of uncertainty.
* **FR_MarketTrend.1:** System must be able to fetch top gainers and top losers for a specific index (e.g., NIFTY 100, NIFTY 500) using the Groww Market Trends API (`GET https://groww.in/v1/api/stocks_data/explore/v2/indices/{index_id}/market_trends?discovery_filter_types={trend_type}&size={limit}`).
* **FR_MarketTrend.2:** System must provide an API endpoint to retrieve the top gainers or losers list, allowing the client to specify the index, trend type, and limit.

**5.4. Virtual Stock Trading**
* FR4.1: Users must be able to place BUY and SELL orders for available stock listings, specifying the symbol and exchange. **Order placement must only be allowed during official market hours (between `marketOpenTime` and `marketCloseTime` for the current IST date, as determined by FR_Market.3).**
* FR4.2: System must support Market Orders for a specific (symbol, exchange) listing, **placed only during market hours**:
    * Buy: Execute at the best available current ask price for that listing. Requires sufficient virtual funds.
    * Sell: Execute at the best available current bid price for that listing. Requires sufficient owned shares of that specific listing in the specified portfolio.
* FR4.3: System must support Limit Orders for a specific (symbol, exchange) listing, **placed only during market hours**:
    * Buy: If placed, status becomes PENDING. Executes only if the market ask price for that listing is at or below the specified limit price *during market hours*. Requires sufficient virtual funds placed on hold.
    * Sell: If placed, status becomes PENDING. Executes only if the market bid price for that listing is at or above the specified limit price *during market hours*. Requires sufficient owned shares of that specific listing placed on hold.
* FR4.4: All order placements must validate against the user's virtual balance (for buys) or holdings of the specific (symbol, exchange) listing (for sells) within the specified portfolio. **The placement must also be validated against current market open status (FR_Market.3).**
* FR4.5: The system must maintain the status of orders (e.g., PENDING, EXECUTED, CANCELLED, FAILED). Orders placed outside market hours should be immediately rejected (or result in a FAILED status with a reason).
* FR4.6: A mechanism (e.g., background task) must exist to attempt matching PENDING limit orders against current market prices for the specific (symbol, exchange) listing. **This matching process should primarily operate during market hours.**
* FR4.7: Users must be able to view their open (PENDING) and historical orders, including the symbol and exchange for each.
* FR4.8: Users must be able to cancel PENDING orders. Cancellation should be possible both during and outside market hours.
* FR4.9: Upon successful order execution, the system must create a corresponding transaction record, linked to the specific (symbol, exchange) listing. Execution timestamps must be recorded accurately.

**5.5. Portfolio Management**
* FR4.1: Users must be able to create multiple named portfolios.
* FR4.2: Users must be able to view a list of their portfolios.
* FR4.3: For each portfolio, users must be able to view:
	* Current holdings (listing identified by stock_symbol, stock_exchange, quantity, average buy price). (Updated)
	* Total portfolio market value (sum of holding values based on current prices of each listing). (Updated)
	* Overall portfolio profit/loss (absolute and percentage).
	* Remaining virtual cash (if managed per portfolio, otherwise user balance).
* FR4.4: Portfolio holdings (quantity and average price for a specific listing) and cash must be updated automatically upon successful order execution linked to that portfolio and listing. (Updated)
* FR4.5: Users must be able to delete empty portfolios.

**5.6. Watchlist Functionality**
* FR5.1: Users must be able to create multiple named watchlists.
* FR5.1.1: The first watchlist created by a user must automatically be marked as their **default watchlist**.
* FR5.2: Users must be able to view a list of their watchlists, with the **default watchlist listed first**.
* FR5.2.1: Users must be able to explicitly set an existing watchlist as their default watchlist.
* FR5.3: Users must be able to add specific stock listings (identified by symbol and exchange) to a specific watchlist.
* FR5.3.1: When a stock listing is added to a watchlist, the system **must store the stock's current price at the time of addition**.
* FR5.3.2: Users must be able to add specific stock listings (identified by symbol and exchange) directly to their **default watchlist** without needing to specify the watchlist ID.
* FR5.4: Users must be able to remove specific stock listings (identified by symbol and exchange) from a watchlist.
* FR5.5: When viewing the stock listings within a specific watchlist, the system must display:
    *   Basic stock details (symbol, exchange, name).
    *   The price at which the stock was added (`price_at_add`).
    *   The stock's current market price.
    *   The calculated absolute change (`current_price - price_at_add`).
    *   The calculated percentage change (`(change / price_at_add) * 100`).
* FR5.6: Users must be able to delete watchlists, **except for their default watchlist**. They must designate another watchlist as default before deleting the current one.
* FR5.7: When viewing the details of a specific watchlist (e.g., its name and metadata), the system must also display calculated performance metrics based on the stocks it contains:
    *   Total initial value (sum of `price_at_add` for all valid stocks).
    *   Total current value (sum of `current_price` for all valid stocks).
    *   Total absolute change (`current_total_value - initial_total_value`).
    *   Total percentage change (`(total_absolute_change / initial_total_value) * 100`).

**5.7. Notification System**
* **FR6.1:** System must generate notifications for users upon successful execution of their orders.
* **FR6.2:** System must generate notifications for users if an order fails or is cancelled.
* **FR6.3:** Users must be able to retrieve their recent notifications.
* **FR6.4:** Users should be able to mark notifications as read.
* **FR6.5:** Notifications should indicate the type of event (e.g., 'ORDER_EXECUTED', 'ORDER_FAILED').

**5.8. News Management**
* **FR_News.1:** System must provide an API endpoint (`GET /api/v1/news/recent?last_seconds={int}`) to retrieve news articles published globally (across all stocks) within the last specified number of seconds. The results must be sorted by `published_at` timestamp in ascending order (earliest first). Each news item in the response must include a computed field `ago` representing the time elapsed since `published_at` in a human-readable format (e.g., "5m ago", "1h ago", "2d ago").

**6. Technical Specifications**
**6.1. Architecture Design**
* **Recommendation:** Modular Monolith initially.
* **Justification:** For a virtual platform starting development, a monolith offers simplicity in development, deployment, and testing compared to microservices. Designing it *modularly* (e.g., clear separation between User, Trading, Portfolio modules within the same codebase) allows for potential future migration to microservices if specific components face disproportionate load or require independent scaling. This balances initial development speed with future flexibility. Microservices introduce overhead (network latency, distributed transactions, complex deployment) that may be unnecessary at this stage.
* **Timezone Handling:** The application layer must consistently operate in **Indian Standard Time (IST, Asia/Kolkata)**. All internal logic (market hour checks, scheduling) and API timestamp representations should use IST. Database storage should utilize `TIMESTAMPTZ` (storing UTC), with the application handling conversion to/from IST.

**6.2. Database Schema**
* Database: PostgreSQL (Recommended)
* Design Rationale: Schema uses composite primary keys (symbol, exchange) to uniquely identify stock listings tracked by the platform. This accurately models stocks potentially listed on multiple exchanges (e.g., NSE, BSE) and allows storing distinct market data per listing via the linked stock_info table. This approach increases schema and query complexity compared to a single symbol identifier but provides correctness. (Updated)
* Key Considerations: Use `UUID`... Use `TIMESTAMP WITH TIME ZONE` for all timestamp fields (stored in UTC, interpreted as IST by the application). Use `Decimal`... Add appropriate indexes... 
* Models:

  

```sql
-- Users & Authentication
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
first_name VARCHAR(100),
last_name VARCHAR(100),
virtual_balance DECIMAL(18, 4) NOT NULL DEFAULT 100000.00, -- User's total virtual cash
is_active BOOLEAN DEFAULT TRUE,
is_admin BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- stocks Table
CREATE TABLE stocks (
symbol VARCHAR(20) NOT NULL, -- e.g., 'RELIANCE' or '500325'
exchange VARCHAR(50) NOT NULL, -- e.g., 'nse', 'bse'
name VARCHAR(255) NOT NULL, -- Name of the stock on this exchange
isinid VARCHAR(50), -- Optional: Standard identifier (might be same across exchanges)
description TEXT, -- Optional: Static description
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (symbol, exchange) -- Composite Primary Key *(Changed)*
);
CREATE INDEX idx_stocks_name ON stocks(name);
CREATE INDEX idx_stocks_isinid ON stocks(isinid);

-- stock_info Table (Moneycontrol Specific Data - Revised Composite PK/FK)
CREATE TABLE stock_info (
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite PK/FK
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite PK/FK
mcid VARCHAR(50) UNIQUE NOT NULL, -- Moneycontrol ID (specific to this listing)
-- Other fields remain the same (bse_id, nse_id, industry, sector, face_value, prices, volume, etc.)
industry VARCHAR(100),
sector VARCHAR(100),
face_value DECIMAL(10, 2),
current_price DECIMAL(18, 4),
bid_price DECIMAL(18, 4),
offer_price DECIMAL(18, 4),
price_prev_close DECIMAL(18, 4),
price_change DECIMAL(18, 4),
price_percent_change DECIMAL(10, 4),
day_high DECIMAL(18, 4),
day_low DECIMAL(18, 4),
volume BIGINT,
last_price_update_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (stock_symbol, stock_exchange), -- Composite Primary Key *(Changed)*
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE CASCADE
);
CREATE INDEX idx_stock_info_mcid ON stock_info(mcid);

-- News Articles (Optional, depends on data source)

CREATE TABLE news (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title VARCHAR(512) NOT NULL,
description TEXT,
url VARCHAR(1024) UNIQUE,
image_url VARCHAR(1024),
content TEXT,
source VARCHAR(100),
published_at TIMESTAMPTZ,
is_analyzed BOOLEAN DEFAULT FALSE, -- Placeholder if analysis is ever added
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
  
-- Many-to-Many relationship between News and Stocks
CREATE TABLE news_stocks (
news_id UUID REFERENCES news(id) ON DELETE CASCADE,
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite PK/FK *(Changed)*
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite PK/FK *(New)*
PRIMARY KEY (news_id, stock_symbol, stock_exchange), -- Composite Primary Key *(Changed)*
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE CASCADE --Composite Foreign Key *(Changed)*
);

-- Portfolios
CREATE TABLE portfolios (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
name VARCHAR(100) NOT NULL,
-- Decide if cash is per-portfolio or user-level. User-level is simpler.
-- virtual_cash_balance DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, name) -- User cannot have two portfolios with the same name
);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
  
-- Holdings within Portfolios (Revised FK)
CREATE TABLE holdings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite FK *(Changed)*
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite FK *(New)*
quantity INTEGER NOT NULL CHECK (quantity >= 0),
average_buy_price DECIMAL(18, 4) NOT NULL,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE RESTRICT, -- Composite Foreign Key *(Changed)*
UNIQUE (portfolio_id, stock_symbol, stock_exchange) -- Composite unique constraint *(Changed)*
);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_stock_symbol ON holdings(stock_symbol);
  
-- Orders
CREATE TYPE order_type AS ENUM ('MARKET', 'LIMIT');
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');
CREATE TYPE order_status AS ENUM ('PENDING', 'EXECUTED', 'CANCELLED', 'FAILED');

CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite FK *(Changed)*
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite FK *(New)*
order_type order_type NOT NULL,
transaction_type transaction_type NOT NULL,
quantity INTEGER NOT NULL CHECK (quantity > 0),
limit_price DECIMAL(18, 4) NULL,
status order_status NOT NULL DEFAULT 'PENDING',
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
executed_at TIMESTAMPTZ NULL,
executed_price DECIMAL(18, 4) NULL,
failure_reason TEXT NULL,
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE RESTRICT -- Composite Foreign Key *(Changed)*
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_portfolio_id ON orders(portfolio_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Transactions (Record of actual executed trades)
CREATE TABLE transactions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite FK *(Changed)*
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite FK *(New)*
transaction_type transaction_type NOT NULL,
quantity INTEGER NOT NULL CHECK (quantity > 0),
price_per_share DECIMAL(18, 4) NOT NULL,
total_amount DECIMAL(18, 4) NOT NULL,
transaction_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE RESTRICT -- Composite Foreign Key *(Changed)*
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_transactions_stock_symbol ON transactions(stock_symbol);
CREATE INDEX idx_transactions_transaction_time ON transactions(transaction_time);

-- Watchlists
CREATE TABLE watchlists (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
name VARCHAR(100) NOT NULL,
is_default BOOLEAN NOT NULL DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, name),
CONSTRAINT uq_user_default_watchlist UNIQUE (user_id, is_default) DEFERRABLE INITIALLY DEFERRED WHERE (is_default IS TRUE)
);
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlists_is_default ON watchlists(user_id, is_default);

-- Many-to-Many relationship between Watchlists and Stocks
CREATE TABLE watchlist_stocks (
watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
stock_symbol VARCHAR(20) NOT NULL, -- Part of composite PK/FK *(Changed)*
stock_exchange VARCHAR(50) NOT NULL, -- Part of composite PK/FK *(New)*
price_at_add DECIMAL(18, 4) NULL, -- Price of the stock when added to this watchlist *(New, Nullable)*
added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (watchlist_id, stock_symbol, stock_exchange), -- Composite Primary Key *(Changed)*
FOREIGN KEY (stock_symbol, stock_exchange) REFERENCES stocks(symbol, exchange) ON DELETE CASCADE -- Composite Foreign Key *(Changed)*
);
  
-- Notifications
CREATE TYPE notification_type AS ENUM ('ORDER_EXECUTED', 'ORDER_FAILED', 'ORDER_CANCELLED', 'SYSTEM_ANNOUNCEMENT'); -- Add more as needed
  
CREATE TABLE notifications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
message TEXT NOT NULL,
type notification_type NOT NULL,
related_entity_id UUID NULL, -- e.g., order_id
is_read BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
  
-- Add trigger functions to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (Apply similarly to stocks, portfolios, holdings, orders, watchlists, news)
```

  

**6.3. API Endpoints (RESTful)**

* **Authentication**
	* `POST /api/v1/auth/register`: Register a new user.
	* `POST /api/v1/auth/login`: Authenticate user, return JWT tokens (access, refresh).
	* `POST /api/v1/auth/refresh`: Obtain a new access token using a refresh token.
	* `POST /api/v1/auth/logout`: (Optional - Can be handled client-side by discarding tokens, or server-side via token blacklist).
* **Users**
	* `GET /api/v1/users/me`: Get current authenticated user's profile (username, email, balance).
	* `PUT /api/v1/users/me`: Update current user's profile (e.g., first/last name).
	* `PATCH /api/v1/users/me/password`: Change user's password.
* **Stocks**
	* `GET /api/v1/stocks`: List available stocks (with pagination, filtering by exchange?).
	* `GET /api/v1/stocks/search`: Search stocks by symbol or name (e.g., `?query=Apple`), optionally filtering by exchange (e.g., `&exchange=nse`).
	* `GET /api/v1/stocks/{exchange}/{symbol}`: Get details and current price for a specific stock listing. 
	* `GET /api/v1/stocks/{symbol}/news`: Get related news articles for a stock.
	* `GET /api/v1/stocks/{exchange}/{symbol}/history`: Get historical OHLCV data for a specific **NSE** stock listing. Query parameters: `resolution` (enum: `1`, `5`, `30`, `60`, `1D`), `from` (unix timestamp), `to` (unix timestamp), `countback` (optional int), `currencyCode` (optional, defaults INR). Returns a list of data points. **Only supports `exchange=nse`.**
* **Market**
    * `GET /api/v1/market/status`: Get the current market status (e.g., `{"status": "OPEN" | "CLOSED" | "UNKNOWN", "open_time_ist": "HH:MM:SS", "close_time_ist": "HH:MM:SS"}`). Allows frontend to display status.
    * `GET /api/v1/market/trends`: Get top market trends. Query parameters: `index` (enum: `SYNIFTY100`, `SYNIFSMCP100`, `SYNIFMDCP100`, `SYNIFTY500`, default: `SYNIFTY100`), `type` (enum: `TOP_GAINERS`, `TOP_LOSERS`, default: `TOP_GAINERS`), `limit` (int, default: 10, max: 60). Returns a list of stocks with company and stats data.
* **News**
    * `GET /api/v1/news/recent`: Get recent news articles published within a specified duration (e.g., `?last_seconds=3600`).
* **Portfolios**
	* `POST /api/v1/portfolios`: Create a new portfolio.
	* `GET /api/v1/portfolios`: List user's portfolios.
	* `GET /api/v1/portfolios/{portfolio_id}`: Get details of a specific portfolio.
	* `DELETE /api/v1/portfolios/{portfolio_id}`: Delete an empty portfolio.
	* `GET /api/v1/portfolios/{portfolio_id}/holdings`: List holdings within a portfolio.
	* `GET /api/v1/portfolios/{portfolio_id}/performance`: Get performance metrics (value, P/L) for a portfolio.
	* `GET /api/v1/portfolios/{portfolio_id}/transactions`: List historical transactions for a portfolio.
* **Orders**
   * `POST /api/v1/orders`: Place a new order. **Request will be rejected if the market is closed.** Request body includes portfolio_id, exchange, symbol, type, side, quantity, limit_price (if applicable). *(Updated)*
    * `GET /api/v1/orders`: List user's orders.
    * `GET /api/v1/orders/{order_id}`: Get details of a specific order.
    * `DELETE /api/v1/orders/{order_id}`: Cancel a PENDING order.
* **Watchlists**
	* `POST /api/v1/watchlists`: Create a new watchlist. The first one created becomes default automatically.
	* `GET /api/v1/watchlists`: List user's watchlists (default listed first).
	* `GET /api/v1/watchlists/{watchlist_id}`: Get details of a specific watchlist. **Response now includes calculated total performance fields (`initial_total_value`, `current_total_value`, `total_change_absolute`, `total_change_percent`).** *(Updated Response)*
	* `POST /api/v1/watchlists/{watchlist_id}/set-default`: Set the specified watchlist as the user's default.
	* `DELETE /api/v1/watchlists/{watchlist_id}`: Delete a watchlist. Fails if the watchlist is the default.
	* `GET /api/v1/watchlists/{watchlist_id}/stocks`: List stocks in a specific watchlist. **Response items now include `price_at_add`, `current_price`, `change_absolute`, `change_percent`.** *(Updated Response)*
	* `POST /api/v1/watchlists/{watchlist_id}/stocks`: Add a stock listing to a specific watchlist (body: `{"exchange": "nse", "symbol": "XYZ"}`). **Stores price at add.** *(Updated Behavior)*
	* `POST /api/v1/watchlists/default/stocks`: Add a stock listing to the user's default watchlist (body: `{"exchange": "nse", "symbol": "XYZ"}`). **Stores price at add.** *(Updated Behavior)*
	* `DELETE /api/v1/watchlists/{watchlist_id}/stocks/{exchange}/{symbol}`: Remove a stock listing from a watchlist.
* **Notifications**
	* `GET /api/v1/notifications`: List user's notifications (unread first, pagination).
	* `PATCH /api/v1/notifications/{notification_id}`: Mark a notification as read.
	* `POST /api/v1/notifications/mark-all-read`: Mark all user's notifications as read.
* **Note:** All API responses containing timestamps should represent them in ISO 8601 format with the IST offset (e.g., `YYYY-MM-DDTHH:MM:SS+05:30`). Watchlist API responses should include the `is_default` flag.

**6.4. Core Features Implementation Details**
* User Authentication: Use JWT (JSON Web Tokens). Access tokens should be short-lived (e.g., 15-60 minutes), refresh tokens longer-lived (e.g., 7 days). Store refresh tokens securely (e.g., in DB associated with user, potentially hashed). Use libraries like `python-jose` or `PyJWT` with `passlib` for password hashing (bcrypt recommended).
* Virtual Trading Engine:
	* **Market Hours Check:** Before accepting any `POST /api/v1/orders` request, the system must check the current time (in IST) against the cached market open/close times for the current IST date (obtained via the Market Status service). If outside hours, reject the request with an appropriate error (e.g., 400 Bad Request) and message. *(New)*
	* * **Order Matching:** The background task fetches/retrieves prices... Matching logic compares limit prices... **This task should ideally run only during market hours or, if running continuously, only attempt to match/execute orders when the market is determined to be open.**
	* Market Orders: Execute using Bid/Ask prices from stock_info for the specified (symbol, exchange).
	* Execution: Updates apply to the specific listing (symbol, exchange) in holdings and user balance.
- **Concurrency:** Handle potential race conditions if multiple processes access balance/holdings simultaneously (use database locking mechanisms like `SELECT FOR UPDATE`).
- **Portfolio Tracking:** Calculations for value and P/L should happen on-demand via API calls or be periodically updated/cached. Average buy price calculation for holdings needs careful implementation (FIFO or weighted average - specify weighted average for simplicity).
- **Notification Delivery:** Use the message queue (Celery) to send notifications asynchronously after events like order execution. Initially, notifications are retrieved via API polling. Future enhancement: WebSockets or Server-Sent Events (SSE) for real-time push.
- **External Data (Moneycontrol API Integration):** (Updated Section)
	- Interaction with the external stock data provider will use the Moneycontrol Price API endpoint: GET https://priceapi.moneycontrol.com/pricefeed/{exchange}/equitycash/{mcid}.
	- The backend needs a robust service/module to handle requests to this API and parse the JSON response. Key fields to extract include: pricecurrent, priceprevclose, pricechange, pricepercentchange, OPN, HP, LP, VOL, BIDP, OFFERP, lastupd, SC_FULLNM, main_sector, isinid, BSEID, NSEID, FV.
	- The parsed pricecurrent, priceprevclose, pricechange, pricepercentchange should be used to update the corresponding fields in the stocks table, along with last_price_update_at. Other static fields (name, sector, etc.) might be updated less frequently or during initial population.
	- Implement caching (e.g., Redis) for the fetched price data (specifically pricecurrent, BIDP, OFFERP, lastupd) with a short TTL (e.g., 15-60 seconds) to reduce redundant API calls and respect potential rate limits. The cache key should likely include the mcid.
	- Crucially, implement comprehensive error handling: detect non-"200" status codes from the API, handle JSON parsing errors, manage network timeouts, and implement backoff strategies for potential rate limiting or API unavailability. Log these events.
* **External Data (Groww Market Timing API Integration):**
    * A dedicated service/module should handle fetching data from `GET https://groww.in/v1/api/stocks_data/v1/market/market_timing?null`.
    * **Fetch Strategy:** Fetch data once per day (e.g., shortly after midnight IST or on the first request requiring it) to get timings for the current and potentially next few trading days.
    * **Parsing:** Parse the JSON response to extract the `dateMarketTimeMap`. Store the relevant `marketOpenTime` and `marketCloseTime` for each date. Assume these times are provided in IST.
    * **Caching:** Cache the fetched timings (e.g., in Redis) with a TTL appropriate for daily data (e.g., 24 hours). The cache key should ideally be the date (`YYYY-MM-DD`).
    * **Market Status Check Logic:** Implement a function `is_market_open()` that:
        1.  Gets the current time in IST.
        2.  Determines the current date in IST.
        3.  Retrieves the cached open/close times for that date.
        4.  If times are available, compares the current time against the open/close times.
        5.  Returns `True` if within market hours, `False` otherwise.
        6.  Handles cases where data for the current date is missing from the cache or API (should return `False` and log an error).
    * **Error Handling:** If the Groww API call fails, log the error. The `is_market_open()` function should return `False` (market assumed closed) to prevent trading under uncertainty. Consider alerting administrators if the API fails consistently.
* **External Data (Groww Market Trends API Integration):**
    * The `app.clients.groww_client` module handles fetching data from `GET https://groww.in/v1/api/stocks_data/explore/v2/indices/{index_id}/market_trends?discovery_filter_types={trend_type}&size={limit}`.
    * The API endpoint allows specifying the index via a query parameter (`index`). Supported values map to Groww IDs:
        * `SYNIFTY100`: `GIDXNIFTY100` (Default)
        * `SYNIFSMCP100`: `GIDXNIFSMCP100`
        * `SYNIFMDCP100`: `GIDXNIFMDCP100`
        * `SYNIFTY500`: `GIDXNIFTY500`
    * The client parses the JSON response into `TrendItem` objects, extracting company details (`companyName`, `nseScriptCode`, `logoUrl`, etc.) and statistics (`ltp`, `dayChangePerc`, etc.).
    * Error handling is implemented to manage HTTP errors, network issues, and data validation failures, returning `None` or raising exceptions as appropriate for the API endpoint to handle.
    * No specific caching is implemented for this endpoint in the client itself, as trend data is highly volatile. Caching could be added at the API endpoint level if needed, but with a very short TTL.
* **Timezone Configuration:** Ensure the Python application environment (e.g., via OS settings or application code using libraries like `pytz` or `zoneinfo`) is configured to use the `Asia/Kolkata` timezone. Use timezone-aware `datetime` objects for all internal processing.
* **External Data (Moneycontrol Stock History API Integration):** *(New Section)*
    - Interaction will use the Moneycontrol Tech Charts API endpoint: `GET https://priceapi.moneycontrol.com/techCharts/indianMarket/stock/history`.
    - This API requires parameters: `symbol`, `resolution` (e.g., 1, 5, 1D), `from` (Unix timestamp), `to` (Unix timestamp), `currencyCode` (INR), and optionally `countback`.
    - The backend service/client (`app.clients.moneycontrol_client.fetch_stock_history`) will construct the request with appropriate parameters.
    - **Constraint:** This API only supports the NSE market (implicit in URL). The backend API endpoint (`/api/v1/stocks/{exchange}/{symbol}/history`) **must reject requests where `exchange` is not 'nse' (case-insensitive)** with a 400 Bad Request.
    - The client parses the JSON response (which has keys 's', 't', 'o', 'h', 'l', 'c', 'v') into structured Pydantic models (`StockHistoryData`, `StockHistoryDataPoint`) defined in `app/schemas/stock.py`.
    - Error handling must cover HTTP errors, network issues, JSON parsing failures, and cases where the API response indicates an error (e.g., `s != "ok"`).
    - No specific caching is planned for history data initially, as requests specify time ranges.

**6.5. Technical Stack Recommendations**
* **Python Framework:** **FastAPI**. Rationale: High performance, built-in data validation (Pydantic), automatic OpenAPI documentation, native async support is beneficial for I/O-bound tasks like external API calls and potentially real-time features later. (Alternatives: Django - more batteries-included, Flask - more lightweight).
* **Database:** **PostgreSQL**. Rationale: Robust, ACID compliant, excellent support for complex queries, JSONB, extensions like PostGIS (if location ever relevant), mature and well-supported. Ensure DB connection timezone is set correctly if necessary, although TIMESTAMPTZ usage is preferred
* **Caching:** **Redis**. Rationale: Fast in-memory data store, good for caching frequently accessed data (stock prices, user sessions, API responses), also serves well as a Celery broker. Used for stock prices and market timings.
* **Message Queue:** **Celery** with **Redis** (or RabbitMQ) as the broker. Rationale: Standard for background task processing in Python. Handles asynchronous tasks like order matching, notification delivery, external data fetching reliably.
* **Data Validation:** **Pydantic** (comes with FastAPI).
* **ORM/Database Interaction:** **SQLAlchemy 2.0+** (async support) or an async ORM like **SQLModel** (built on Pydantic and SQLAlchemy) or **Tortoise ORM**.
* **Timezone Library:** **`pytz`** or Python 3.9+ **`zoneinfo`**. 

**7. Non-Functional Requirements**
**7.1. Performance Requirements**
- **API Latency:** Average API response time < 300ms (p95 < 500ms) for standard CRUD operations under expected load.
- **Watchlist Details Latency:** The `GET /api/v1/watchlists/{watchlist_id}` endpoint, which includes calculations, should leverage **caching (e.g., Redis)** to ensure subsequent requests for the same watchlist are served quickly (target < 50ms on cache hit). Cache invalidation occurs when watchlist contents change. *(New/Updated)*
- **Order Processing Latency:** Market orders should be reflected in the user's portfolio within 5 seconds of placement (assuming price data is available). Limit order matching depends on the task frequency but should process pending orders efficiently. Limit order matching during market hours depends on task frequency...
- **Throughput:** Initial target: Handle 100 concurrent users / 500 requests per minute. Design should allow scaling to 10x this load.

**7.2. Scalability**
* The application should be stateless to allow horizontal scaling of the API server instances behind a load balancer.
* Asynchronous task processing via Celery workers allows scaling the background processing independently.
* Database scaling can be addressed later via read replicas, connection pooling optimization, and eventually sharding if necessary.
* Caching layer (Redis) reduces database load, **particularly for watchlist performance calculations**. *(Updated)*

**7.3. Reliability/Availability**
* Target uptime: 99.9%.
* Implement robust error handling and logging.
* Use database backups and potentially point-in-time recovery.
* Deployments should aim for zero downtime (e.g., blue/green deployment).
* Dependency: System reliability for placing orders is dependent on the availability and correctness of the external Groww Market Timing API. Implement monitoring and fallback (prevent trading) for API failures.

**7.4. Security Considerations**
* **Authentication:** Secure JWT handling (HTTPS, short expiry, secure refresh tokens). Strong password hashing (bcrypt).
* **Authorization:** Enforce endpoint protection based on user roles and ownership (users can only access/modify their own data).
* **Input Validation:** Rigorous validation of all API inputs (using Pydantic/FastAPI) to prevent injection attacks.
* **Data Protection:** Encrypt sensitive data if necessary (beyond passwords). Use HTTPS for all communication. Securely store external API keys.
* **Rate Limiting:** Implement rate limiting on API endpoints (especially auth) to prevent abuse.
* **Dependencies:** Keep all libraries and system dependencies up-to-date with security patches.
* **Secrets Management:** Use a secure method for managing secrets (API keys, database passwords) - e.g., environment variables, secrets manager service.

**8. Testing Strategy**
* **Unit Tests:** Use `pytest`. Mock external dependencies (database, external APIs, Celery tasks). Focus on testing business logic in services, utilities, and data transformations. Aim for >80% code coverage.
* **Integration Tests:** Test the interaction between API endpoints, services, and the database. Use a dedicated test database. Validate API request/response schemas and status codes. Test authentication and authorization logic.
* **End-to-End (E2E) Tests:** (Optional, often driven by frontend) Simulate user flows through the API.
* **Load Tests:** Use tools like `Locust` or `k6` to simulate concurrent user load, identify performance bottlenecks, and validate performance/scalability requirements.
* **Security Testing:** Perform basic security scans (e.g., using tools like `Bandit` for static analysis). Consider penetration testing for production releases.

**9. Deployment Strategy**
* **Containerization:** Use Docker to containerize the application and its dependencies.
* **Orchestration:** Use Kubernetes (K8s) or similar (e.g., Docker Swarm, managed cloud services like AWS ECS/EKS, Google Cloud Run/GKE) for deployment, scaling, and management.
* **CI/CD:** Implement a CI/CD pipeline (e.g., GitHub Actions, GitLab CI, Jenkins) to automate testing, building container images, and deploying to staging/production environments.
* **Environments:** Maintain separate environments (Development, Staging, Production) with configurations managed appropriately.
* **Logging & Monitoring:** Implement centralized logging (e.g., ELK stack, Grafana Loki) and application performance monitoring (APM) (e.g., Datadog, Sentry, Prometheus/Grafana).

**10. Future Considerations**
* Real-time price updates via WebSockets.
* Advanced order types (stop-loss, etc.).
* More sophisticated portfolio analytics.
* Support for different asset classes (crypto, options).
* Admin dashboard for user management and system monitoring.
* Social features.
* Integration with more data providers (news, fundamentals).
* Price alert notifications.

**11. Assumptions/Dependencies**
* A reliable external API for stock symbols, company information, and price data is available and accessible. The limitations (cost, rate limits, data delay) of this API will impact the platform's capabilities.
* The platform operates solely with virtual currency; no real financial regulations apply directly to the simulation logic.
* Frontend development will handle all UI/UX aspects and interact solely through the defined backend APIs.
---