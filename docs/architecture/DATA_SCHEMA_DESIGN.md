# Data Schema Design Specification

**Version:** 1.0  
**Date:** 2024  
**Status:** Draft for Review

---

## Table of Contents

1. [Overview & Scope](#overview--scope)
2. [Data Governance Standards](#data-governance-standards)
   1. [Lineage Metadata Standardisation](#lineage-metadata-standardisation)
   2. [Identifier & Naming Conventions](#identifier--naming-conventions)
   3. [Temporal Data & Partitioning](#temporal-data--partitioning)
   4. [Security & Access Controls](#security--access-controls)
3. [Relational Data Model (PostgreSQL / TimescaleDB)](#relational-data-model-postgresql--timescaledb)
   1. [Logical ERD Overview](#logical-erd-overview)
   2. [Companies & Instruments](#companies--instruments)
   3. [Financial Statements & Ratios](#financial-statements--ratios)
   4. [Ownership & Shareholding](#ownership--shareholding)
   5. [Alerts & Notifications](#alerts--notifications)
   6. [Portfolios & Holdings](#portfolios--holdings)
   7. [Reports & Publications](#reports--publications)
   8. [Audit Logs & Compliance](#audit-logs--compliance)
   9. [Reference Tables & Enums](#reference-tables--enums)
4. [MongoDB Document Collections](#mongodb-document-collections)
   1. [Research & Regulatory Documents](#research--regulatory-documents)
   2. [Model Artefacts & Feature Snapshots](#model-artefacts--feature-snapshots)
   3. [User-Generated Notes](#user-generated-notes)
5. [Elasticsearch Index Mappings](#elasticsearch-index-mappings)
   1. [Company & Instrument Search](#company--instrument-search)
   2. [Document & Research Search](#document--research-search)
   3. [Alert & Signal Search](#alert--signal-search)
6. [Redis Cache Strategy](#redis-cache-strategy)
   1. [Keyspaces](#keyspaces)
   2. [Caching Policies](#caching-policies)
   3. [Invalidation & Refresh](#invalidation--refresh)
7. [Analytics Warehouse Layout](#analytics-warehouse-layout)
   1. [Dimensional Model](#dimensional-model)
   2. [Fact Tables](#fact-tables)
   3. [ETL, Data Quality & Lineage](#etl-data-quality--lineage)
8. [Appendix](#appendix)
   1. [Lineage Verification Status Enumeration](#lineage-verification-status-enumeration)
   2. [Sample DDL Snippets](#sample-ddl-snippets)

---

## Overview & Scope

This document defines the enterprise data model for the AI-driven Indian markets platform. It expands on the [Platform Blueprint](./PLATFORM_BLUEPRINT.md) by providing:

- A relational entity-relationship design for operational workloads on PostgreSQL 15 with TimescaleDB extensions for time-series data.
- Canonical schemas for financial statements, ratios, ownership, alerts, portfolios, reports, and audit logs.
- Consistent lineage metadata across all storage layers.
- Supporting designs for MongoDB, Elasticsearch, Redis, and the downstream analytics warehouse.
- Implementation guidance for indexing, partitioning, and data governance.

The specification is intended for data engineers, backend engineers, and architects who will implement, evolve, and govern the platform's data layer.

---

## Data Governance Standards

### Lineage Metadata Standardisation

All persisted records must carry standard lineage metadata to enable traceability, compliance (SEBI 7-year retention), and reproducibility.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source_name` | `text` / `string` | ✅ | Logical identifier of the upstream system (e.g., `NSE_API`, `Internal_Model_V1`). |
| `source_url` | `text` / `string` | ✅ | Canonical link or API endpoint from which the record originated. |
| `timestamp` | `timestamptz` / `ISODate` | ✅ | Ingestion or publication timestamp in UTC. |
| `verification_status` | Enum (`RAW`, `PARSED`, `VERIFIED`, `SUPERSEDED`) | ✅ | Data quality state as defined in [Appendix A](#lineage-verification-status-enumeration). |

**Implementation notes:**
- PostgreSQL tables use `TIMESTAMPTZ` and default to `NOW()` when the field is not supplied.
- MongoDB stores timestamps as `ISODate` objects, Elasticsearch as `date` fields, and Redis encodes timestamps using RFC3339 strings.
- Services must not diverge from these field names. When duplicated within nested structures (e.g., JSONB payloads), the same field spelling is retained to ease lineage tracing.

### Identifier & Naming Conventions

- Surrogate primary keys use the `*_id` suffix and `UUID` (PostgreSQL `uuid_generate_v7()` / ULID) to maintain global uniqueness.
- Natural keys are preserved in dedicated columns (`isin`, `nse_symbol`, `bse_code`) with unique constraints where applicable.
- Bridge tables follow `{entity_a}_{entity_b}` naming (e.g., `company_industry_map`).
- Timescale hypertables are prefixed with `ts_` to highlight time-series storage (e.g., `ts_instrument_prices`).
- Text columns that store enumerated values reference enumerations defined in [Reference Tables & Enums](#reference-tables--enums).

### Temporal Data & Partitioning

- Timescale hypertables partition by `time_bucket` intervals tuned per dataset:
  - Market prices, ratios: 1-minute buckets.
  - Portfolio valuations: daily bucket.
  - Alerts: event-time bucket (hourly).
- Historical relational tables (e.g., `financial_statement_facts`) use native PostgreSQL range partitioning on `fiscal_period_start`.
- All timestamps are stored in UTC.
- Soft deletion uses `deleted_at TIMESTAMPTZ` with partial indexes to exclude deleted records from OLTP queries.

### Security & Access Controls

- Row Level Security (RLS) is enabled for PII-bearing tables (`portfolios`, `ownership_positions`). Access policies rely on `tenant_id` and `user_id` dimensions.
- Sensitive documents stored in MongoDB reference encrypted blobs in S3 with CMK-backed KMS keys. Metadata remains in MongoDB for queryability.
- Audit logs are append-only; only privileged compliance services can query or export full histories.

---

## Relational Data Model (PostgreSQL / TimescaleDB)

### Logical ERD Overview

```
┌──────────┐      ┌─────────────┐      ┌────────────────┐
│ companies├──────► instruments  ├──────► ts_instrument_prices
└─────┬────┘ 1..* └──────┬──────┘      └────────────────┘
      │                  │
      │                  │               ┌─────────────────────┐
      │                  └──────┬────────► financial_statements │
      │                         │        └─────────┬───────────┘
      │                         │                  │
      │                         │                  ▼
      │                         │          financial_statement_facts
      │                         │                  │
      │                         │                  ▼
      │                         └──────────► financial_ratios
      │
      │        ┌─────────────────┐
      ├───────► ownership_holders│
      │        └────────┬────────┘
      │                 │
      ▼                 ▼
alerts ◄──────┬────── portfolios ─────► portfolio_positions ───► ts_portfolio_valuations
              │
              └────► reports ──► report_artifacts

audit_logs observe changes across all primary domains.
```

> **Note:** Detailed per-domain diagrams are provided in the subsections below. The audit trail references all transactional entities through polymorphic foreign keys.

### Companies & Instruments

#### Table: `companies`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `company_id` | `uuid` | ❌ | `uuid_generate_v7()` | Surrogate primary key. |
| `legal_name` | `text` | ❌ | | Registered legal name. |
| `short_name` | `text` | ✅ | | Display name / ticker-friendly name. |
| `cin` | `text` | ✅ | | Corporate Identification Number (unique, nullable). |
| `lei` | `text` | ✅ | | Legal Entity Identifier. |
| `incorporation_date` | `date` | ✅ | | Date of incorporation. |
| `industry_sector_id` | `uuid` | ✅ | | FK to `industry_sectors`. |
| `country_code` | `char(2)` | ❌ | `'IN'` | ISO-3166 alpha-2 country. |
| `website_url` | `text` | ✅ | | Official website. |
| `status` | `company_status_enum` | ❌ | `'ACTIVE'` | Lifecycle status (ACTIVE, SUSPENDED, DELISTED). |
| `created_at` | `timestamptz` | ❌ | `now()` | Row creation timestamp. |
| `updated_at` | `timestamptz` | ❌ | `now()` | Last update timestamp. |
| `deleted_at` | `timestamptz` | ✅ | | Soft delete marker. |
| `source_name` | `text` | ❌ | | Lineage metadata. |
| `source_url` | `text` | ❌ | | Lineage metadata. |
| `timestamp` | `timestamptz` | ❌ | `now()` | Lineage ingestion timestamp. |
| `verification_status` | `verification_status_enum` | ❌ | `'RAW'` | Lineage verification state. |

**Indexes**
- `UNIQUE (cin)` filtered on `deleted_at IS NULL`.
- B-tree on `(industry_sector_id, status)` for filtering.

#### Table: `company_aliases`

Captures alternative names for fuzzy searches.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `company_alias_id` | `uuid` | ❌ | PK. |
| `company_id` | `uuid` | ❌ | FK to `companies`. |
| `alias` | `text` | ❌ | Alternate name. |
| `alias_type` | `alias_type_enum` | ❌ | (TRADE_NAME, BRAND, LEGACY).
| `valid_from` | `date` | ❌ | Start date. |
| `valid_to` | `date` | ✅ | Inclusive end date. |
| `source_name` | `text` | ❌ | |
| `source_url` | `text` | ❌ | |
| `timestamp` | `timestamptz` | ❌ | |
| `verification_status` | `verification_status_enum` | ❌ | |

#### Table: `instruments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `instrument_id` | `uuid` | ❌ | PK. |
| `company_id` | `uuid` | ✅ | FK to `companies`; null for index/ETF instruments. |
| `instrument_type` | `instrument_type_enum` | ❌ | (EQUITY, DEBT, ETF, MF, DERIVATIVE). |
| `name` | `text` | ❌ | Instrument descriptive name. |
| `isin` | `text` | ✅ | Unique constraint with filter. |
| `nse_symbol` | `text` | ✅ | |
| `bse_code` | `text` | ✅ | |
| `currency` | `char(3)` | ❌ | ISO-4217 code. |
| `listing_date` | `date` | ✅ | |
| `expiry_date` | `date` | ✅ | Derivatives only. |
| `status` | `instrument_status_enum` | ❌ | `'ACTIVE'`. |
| `lot_size` | `integer` | ✅ | Minimum tradable lot. |
| `tick_size` | `numeric(12,6)` | ✅ | Price tick. |
| `source_name` | `text` | ❌ | |
| `source_url` | `text` | ❌ | |
| `timestamp` | `timestamptz` | ❌ | |
| `verification_status` | `verification_status_enum` | ❌ | |

**Indexes**
- `UNIQUE (isin)` partial on `verification_status <> 'SUPERSEDED'`.
- `GIN` on `(to_tsvector('english', name))` for text search fallback.

#### Table: `instrument_listings`

Stores exchange-specific listing metadata.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `instrument_listing_id` | `uuid` | ❌ | PK. |
| `instrument_id` | `uuid` | ❌ | FK to `instruments`. |
| `exchange` | `exchange_enum` | ❌ | (NSE, BSE, MCX, NCDEX). |
| `symbol` | `text` | ❌ | Exchange trading symbol. |
| `segment` | `text` | ✅ | (EQ, FNO, CDS). |
| `lot_size` | `integer` | ✅ | |
| `tick_size` | `numeric(12,6)` | ✅ | |
| `is_primary` | `boolean` | ❌ | Indicates canonical listing. |
| `source_name` | `text` | ❌ | |
| `source_url` | `text` | ❌ | |
| `timestamp` | `timestamptz` | ❌ | |
| `verification_status` | `verification_status_enum` | ❌ | |

**Timescale Hypertable: `ts_instrument_prices`**

| Column | Type | Description |
|--------|------|-------------|
| `instrument_id` | `uuid` | FK to `instruments`. |
| `bucketed_at` | `timestamptz` | Time bucket (1-minute granularity). |
| `open` | `numeric(18,6)` | |
| `high` | `numeric(18,6)` | |
| `low` | `numeric(18,6)` | |
| `close` | `numeric(18,6)` | |
| `volume` | `numeric(28,0)` | |
| `oi` | `numeric(28,0)` | Derivatives open interest. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | See [Lineage](#lineage-metadata-standardisation). |

Hypertable configuration:

```sql
CREATE TABLE ts_instrument_prices (
  instrument_id uuid NOT NULL REFERENCES instruments(instrument_id),
  bucketed_at timestamptz NOT NULL,
  open numeric(18,6),
  high numeric(18,6),
  low numeric(18,6),
  close numeric(18,6),
  volume numeric(28,0),
  oi numeric(28,0),
  source_name text NOT NULL,
  source_url text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  verification_status verification_status_enum NOT NULL DEFAULT 'RAW',
  PRIMARY KEY (instrument_id, bucketed_at)
);

SELECT create_hypertable('ts_instrument_prices', 'bucketed_at', chunk_time_interval => INTERVAL '1 day');
SELECT add_compression_policy('ts_instrument_prices', INTERVAL '7 days');
```

A continuous aggregate `cagg_instrument_prices_ohlc_daily` will provide daily summaries for reporting.

### Financial Statements & Ratios

Financial statements follow a highly normalised structure to accommodate diverse filing formats (standalone vs. consolidated, quarterly vs. annual).

#### Table: `financial_statements`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `financial_statement_id` | `uuid` | ❌ | PK. |
| `company_id` | `uuid` | ❌ | FK to `companies`. |
| `statement_type` | `statement_type_enum` | ❌ | (BALANCE_SHEET, INCOME_STATEMENT, CASH_FLOW). |
| `filing_type` | `filing_type_enum` | ❌ | (QUARTERLY, ANNUAL, HALF_YEARLY). |
| `period_start` | `date` | ❌ | Beginning of fiscal period. |
| `period_end` | `date` | ❌ | End of fiscal period. |
| `currency` | `char(3)` | ❌ | |
| `is_consolidated` | `boolean` | ❌ | |
| `reported_on` | `date` | ❌ | Filing publication date. |
| `audited` | `boolean` | ❌ | Indicates audit status. |
| `source_document_id` | `uuid` | ✅ | References Mongo `documents._id`. |
| `revision_number` | `integer` | ❌ | Versioning for restatements. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | | See [Lineage](#lineage-metadata-standardisation). |

Composite unique constraint ensures one entry per company/statement/period/revision.

#### Table: `financial_statement_line_items`

Defines a controlled vocabulary of line items aligned with XBRL taxonomy.

| Column | Type | Description |
|--------|------|-------------|
| `line_item_id` | `uuid` | PK. |
| `taxonomy_code` | `text` | XBRL or internal code. |
| `display_name` | `text` | Human-readable label. |
| `statement_type` | `statement_type_enum` | Applicable statement. |
| `calculation_sign` | `integer` | +1 or -1 for rollups. |
| `parent_line_item_id` | `uuid` | Self-referencing for hierarchy. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `financial_statement_facts`

Stores numeric facts for each line item and period.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `fact_id` | `uuid` | ❌ | PK. |
| `financial_statement_id` | `uuid` | ❌ | FK to `financial_statements`. |
| `line_item_id` | `uuid` | ❌ | FK to `financial_statement_line_items`. |
| `value` | `numeric(38,6)` | ❌ | Reported value. |
| `unit` | `text` | ❌ | Measurement unit (INR, SHARES). |
| `as_reported` | `boolean` | ❌ | If true, value is raw; false = normalized. |
| `restated` | `boolean` | ❌ | Flag if part of a restatement. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | | |

Partitioned by `period_end` to support efficient historical queries.

#### Table: `financial_ratios`

Derived metrics stored in Timescale for temporal analytics.

| Column | Type | Description |
|--------|------|-------------|
| `company_id` | `uuid` | |
| `ratio_code` | `text` | Enum referencing `ratio_definitions`. |
| `calculated_at` | `timestamptz` | Calculation timestamp (hypertable time column). |
| `value` | `numeric(20,8)` | |
| `calculation_window` | `text` | `"TTM"`, `"MRQ"`, etc. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

Hypertable chunk interval: 7 days with compression beyond 90 days.

#### Table: `ratio_definitions`

Stores formula metadata for reproducibility.

| Column | Type | Description |
|--------|------|-------------|
| `ratio_code` | `text` | Primary key. |
| `name` | `text` | |
| `formula` | `text` | Expression referencing canonical line items. |
| `category` | `ratio_category_enum` | Profitability, Liquidity, Efficiency, Leverage. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

### Ownership & Shareholding

#### Table: `ownership_holders`

| Column | Type | Description |
|--------|------|-------------|
| `holder_id` | `uuid` | PK. |
| `holder_type` | `holder_type_enum` | (PROMOTER, INSTITUTIONAL, RETAIL, INSIDER). |
| `name` | `text` | |
| `registration_number` | `text` | PAN / SEBI Reg number. |
| `country_code` | `char(2)` | |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `ownership_positions`

Captures quarterly shareholding patterns.

| Column | Type | Description |
|--------|------|-------------|
| `ownership_position_id` | `uuid` | PK. |
| `company_id` | `uuid` | FK. |
| `holder_id` | `uuid` | FK. |
| `as_of_date` | `date` | Reporting date. |
| `share_count` | `numeric(28,0)` | |
| `share_percentage` | `numeric(9,4)` | |
| `holding_type` | `holding_type_enum` | (DIRECT, PLEDGED, DERIVATIVE). |
| `is_latest` | `boolean` | Flag maintained via partial index. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

Partial unique index on `(company_id, holder_id)` where `is_latest = true` to speed lookups.

### Alerts & Notifications

Alerts originate from trading signals, compliance rules, or user-defined triggers.

#### Table: `alerts`

| Column | Type | Description |
|--------|------|-------------|
| `alert_id` | `uuid` | PK. |
| `tenant_id` | `uuid` | Multi-tenant segregation. |
| `alert_type` | `alert_type_enum` | (PRICE_THRESHOLD, NEWS, COMPLIANCE, PORTFOLIO_DRAW_DOWN). |
| `entity_type` | `alert_entity_enum` | (INSTRUMENT, COMPANY, PORTFOLIO). |
| `entity_id` | `uuid` | Polymorphic FK referencing entity_type. |
| `created_by` | `uuid` | User who configured alert. |
| `condition_expression` | `jsonb` | DSL storing trigger conditions. |
| `is_active` | `boolean` | |
| `severity` | `alert_severity_enum` | (INFO, WARNING, CRITICAL). |
| `channel_preferences` | `jsonb` | Email/SMS/Push toggles. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `alert_events`

Timescale hypertable capturing alert firings.

| Column | Type | Description |
|--------|------|-------------|
| `alert_id` | `uuid` | FK to `alerts`. |
| `triggered_at` | `timestamptz` | Time bucket (5-minute chunk). |
| `payload` | `jsonb` | Details (e.g., price deviation). |
| `delivered_channels` | `jsonb` | Delivery outcomes. |
| `acknowledged_by` | `uuid` | User id if acknowledged. |
| `acknowledged_at` | `timestamptz` | |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

Hypertable chunk interval: 1 day; retention policy 400 days (13 months) before archiving to S3.

### Portfolios & Holdings

#### Table: `portfolios`

| Column | Type | Description |
|--------|------|-------------|
| `portfolio_id` | `uuid` | PK. |
| `tenant_id` | `uuid` | |
| `owner_type` | `portfolio_owner_type_enum` | (USER, ADVISOR, INSTITUTION). |
| `owner_id` | `uuid` | | User or entity reference. |
| `name` | `text` | |
| `base_currency` | `char(3)` | Default `INR`. |
| `objective` | `text` | |
| `risk_profile` | `risk_profile_enum` | (CONSERVATIVE, BALANCED, AGGRESSIVE). |
| `created_at`, `updated_at`, `deleted_at` | `timestamptz` | |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

RLS restricts access by `tenant_id`/`owner_id`.

#### Table: `portfolio_accounts`

Supports multi-account portfolios (e.g., trading, demat, MF).

| Column | Type | Description |
|--------|------|-------------|
| `portfolio_account_id` | `uuid` | PK. |
| `portfolio_id` | `uuid` | FK. |
| `account_type` | `portfolio_account_type_enum` | (EQUITY, MF, COMMODITY). |
| `broker_id` | `uuid` | FK to `brokers` reference table. |
| `account_number` | `text` | Tokenised reference. |
| `integration_metadata` | `jsonb` | Credentials alias / connection info. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `portfolio_positions`

| Column | Type | Description |
|--------|------|-------------|
| `portfolio_position_id` | `uuid` | PK. |
| `portfolio_account_id` | `uuid` | FK. |
| `instrument_id` | `uuid` | FK to `instruments`. |
| `quantity` | `numeric(28,6)` | |
| `avg_cost` | `numeric(18,6)` | Weighted average cost. |
| `market_value` | `numeric(18,6)` | Real-time snapshot updated via jobs. |
| `last_valuation_at` | `timestamptz` | |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

Unique constraint on `(portfolio_account_id, instrument_id)` with partial filter for active positions.

#### Table: `portfolio_transactions`

| Column | Type | Description |
|--------|------|-------------|
| `transaction_id` | `uuid` | PK. |
| `portfolio_account_id` | `uuid` | FK. |
| `instrument_id` | `uuid` | FK. |
| `transaction_type` | `transaction_type_enum` | (BUY, SELL, DIVIDEND, FEE). |
| `executed_at` | `timestamptz` | |
| `quantity` | `numeric(28,6)` | |
| `price` | `numeric(18,6)` | Execution price. |
| `fees` | `numeric(18,6)` | Brokerage, taxes. |
| `notes` | `text` | |
| `source_reference` | `text` | Broker contract note id. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Timescale Hypertable: `ts_portfolio_valuations`

Daily performance snapshots per portfolio.

| Column | Type | Description |
|--------|------|-------------|
| `portfolio_id` | `uuid` | |
| `valuation_date` | `date` | Time column (daily bucket). |
| `nav` | `numeric(18,6)` | Net asset value. |
| `cash_balance` | `numeric(18,6)` | |
| `invested_amount` | `numeric(18,6)` | |
| `realized_pnl` | `numeric(18,6)` | |
| `unrealized_pnl` | `numeric(18,6)` | |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

Compression after 180 days, retention 10 years.

### Reports & Publications

#### Table: `reports`

| Column | Type | Description |
|--------|------|-------------|
| `report_id` | `uuid` | PK. |
| `report_type` | `report_type_enum` | (PORTFOLIO, COMPLIANCE, MARKET_INSIGHT). |
| `title` | `text` | |
| `description` | `text` | |
| `created_by` | `uuid` | User or system reference. |
| `schedule_cron` | `text` | Null for ad-hoc reports. |
| `parameters` | `jsonb` | Report configuration. |
| `destination` | `report_destination_enum` | (EMAIL, S3, DASHBOARD). |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `report_runs`

| Column | Type | Description |
|--------|------|-------------|
| `report_run_id` | `uuid` | PK. |
| `report_id` | `uuid` | FK to `reports`. |
| `requested_at` | `timestamptz` | |
| `status` | `report_run_status_enum` | (QUEUED, IN_PROGRESS, SUCCESS, FAILED). |
| `started_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | |
| `error_payload` | `jsonb` | Failure context. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

#### Table: `report_artifacts`

Stores output metadata linking to S3/MinIO objects.

| Column | Type | Description |
|--------|------|-------------|
| `report_artifact_id` | `uuid` | PK. |
| `report_run_id` | `uuid` | FK. |
| `artifact_type` | `artifact_type_enum` | (PDF, CSV, XLSX, JSON). |
| `storage_uri` | `text` | S3 URI. |
| `checksum` | `text` | SHA-256 for integrity. |
| `size_bytes` | `bigint` | |
| `expires_at` | `timestamptz` | TTL for downloads. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

### Audit Logs & Compliance

Audit logs capture immutable user and system actions required by SEBI.

#### Table: `audit_events`

| Column | Type | Description |
|--------|------|-------------|
| `audit_event_id` | `uuid` | PK. |
| `tenant_id` | `uuid` | |
| `actor_type` | `audit_actor_type_enum` | (USER, SERVICE, SYSTEM). |
| `actor_id` | `uuid` | |
| `action` | `text` | Normalised verb (e.g., `PORTFOLIO_TRADE_EXECUTED`). |
| `entity_type` | `audit_entity_enum` | |
| `entity_id` | `uuid` | |
| `context` | `jsonb` | Additional metadata (IP, user-agent). |
| `occurred_at` | `timestamptz` | Event time. |
| `recorded_at` | `timestamptz` | Ingestion time (defaults to `now()`). |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

**Policies**
- Append-only via `INSERT`. `DELETE` disabled; archival handled by partitioning (monthly partitions) and export to cold storage beyond 7 years.
- Partition key: `occurred_at` with local indexes on `(tenant_id, occurred_at)`.

#### Table: `audit_event_signatures`

Optional table giving cryptographic integrity for high-value events.

| Column | Type | Description |
|--------|------|-------------|
| `audit_event_id` | `uuid` | FK to `audit_events`. |
| `hash_algorithm` | `text` | (SHA256). |
| `signature` | `bytea` | Digital signature stored via HSM. |
| `source_name`, `source_url`, `timestamp`, `verification_status` | | |

### Reference Tables & Enums

Key reference data supporting the model:

| Table | Purpose |
|-------|---------|
| `industry_sectors` | GICS-aligned sector hierarchy. |
| `exchanges` | Metadata for exchanges (timezone, MIC code). |
| `brokers` | Registered brokers / custodians. |
| `currencies` | ISO currency table for validation. |
| `verification_status_enum` | See [Appendix A](#lineage-verification-status-enumeration). |
| Additional enums (`instrument_type_enum`, `alert_type_enum`, etc.) ensure integrity across services.

All reference tables inherit the lineage metadata columns for provenance.

---

## MongoDB Document Collections

MongoDB stores semi-structured and large documents unsuitable for relational tables. All collections include a `lineage` subdocument mirroring the standard fields for easier indexing.

### Research & Regulatory Documents

**Collection:** `documents`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Primary key, referenced by SQL `financial_statements.source_document_id`. |
| `document_type` | `string` | (ANNUAL_REPORT, INVESTOR_PRESENTATION, COMPLIANCE_NOTICE). |
| `title` | `string` | |
| `company_id` | `UUID` | Cross-store reference. |
| `instrument_id` | `UUID` | Optional. |
| `filing_period` | `{start: ISODate, end: ISODate}` | |
| `storage_uri` | `string` | Encrypted S3 path. |
| `checksum` | `string` | SHA-256. |
| `extracted_text` | `string` | Full-text content for search indexing. |
| `tags` | `[string]` | Keyword tagging. |
| `lineage` | `{source_name, source_url, timestamp, verification_status}` | Embedded lineage metadata. |
| `created_at` | `ISODate` | |
| `updated_at` | `ISODate` | |

Indexes: compound `({company_id: 1, document_type: 1, "lineage.timestamp": -1})` and full-text index on `extracted_text` for fallback search.

### Model Artefacts & Feature Snapshots

**Collection:** `model_feature_snapshots`

| Field | Description |
|-------|-------------|
| `_id` | ObjectId. |
| `model_id` | UUID referencing ML registry. |
| `instrument_id` | UUID. |
| `as_of` | ISODate representing feature timestamp. |
| `features` | Object storing feature name-value pairs. |
| `computed_by` | String referencing pipeline. |
| `lineage` | Standard metadata. |
| `expires_at` | ISODate for TTL cleanup. |

TTL index on `expires_at` ensures automatic pruning of stale feature sets.

### User-Generated Notes

**Collection:** `research_notes`

| Field | Description |
|-------|-------------|
| `_id` | ObjectId. |
| `tenant_id` | UUID. |
| `author_id` | UUID. |
| `scope` | Enum (COMPANY, INSTRUMENT, PORTFOLIO). |
| `scope_ref` | UUID referencing scope entity. |
| `content` | Rich text / Markdown. |
| `mentions` | Array of instrument/company IDs for cross-linking. |
| `privacy_level` | Enum (PRIVATE, TEAM, PUBLIC). |
| `attachments` | Array of `{document_id, caption}` referencing `documents`. |
| `lineage` | Standard metadata. |
| `created_at`, `updated_at` | ISODate. |

Compound index: `{tenant_id: 1, scope: 1, scope_ref: 1, "lineage.timestamp": -1}`.

---

## Elasticsearch Index Mappings

All indices share an ingest pipeline that flattens lineage metadata to `lineage.source_name`, `lineage.source_url`, `lineage.timestamp`, and `lineage.verification_status` fields with `keyword` type for filtering and `date` for timestamp.

### Company & Instrument Search

**Index:** `search_companies_instruments`

Mapping highlights:

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "entity_type": {"type": "keyword"},
      "company_id": {"type": "keyword"},
      "instrument_id": {"type": "keyword"},
      "legal_name": {"type": "text", "fields": {"raw": {"type": "keyword", "ignore_above": 256}}},
      "aliases": {"type": "text"},
      "tickers": {"type": "keyword"},
      "sector": {"type": "keyword"},
      "status": {"type": "keyword"},
      "listing_exchange": {"type": "keyword"},
      "metrics": {
        "properties": {
          "market_cap": {"type": "double"},
          "pe_ratio": {"type": "double"},
          "dividend_yield": {"type": "double"}
        }
      },
      "updated_at": {"type": "date"},
      "lineage": {
        "properties": {
          "source_name": {"type": "keyword"},
          "source_url": {"type": "keyword"},
          "timestamp": {"type": "date"},
          "verification_status": {"type": "keyword"}
        }
      }
    }
  }
}
```

Provides auto-complete via edge n-gram analyser on `legal_name` and `aliases`.

### Document & Research Search

**Index:** `search_documents`

- Text fields analysed using `hinglish` analyzer (supports mixed Hindi/English).
- Highlighting enabled on `extracted_text` and `summary`.
- Nested `tags` for faceted filtering.

```json
{
  "properties": {
    "document_id": {"type": "keyword"},
    "document_type": {"type": "keyword"},
    "title": {"type": "text"},
    "summary": {"type": "text"},
    "company_id": {"type": "keyword"},
    "filing_period": {
      "properties": {
        "start": {"type": "date"},
        "end": {"type": "date"}
      }
    },
    "tags": {"type": "keyword"},
    "lineage": {
      "properties": {
        "source_name": {"type": "keyword"},
        "source_url": {"type": "keyword"},
        "timestamp": {"type": "date"},
        "verification_status": {"type": "keyword"}
      }
    }
  }
}
```

### Alert & Signal Search

**Index:** `search_alerts`

- Allows compliance tooling to quickly query historical alerts.

```json
{
  "properties": {
    "alert_id": {"type": "keyword"},
    "tenant_id": {"type": "keyword"},
    "alert_type": {"type": "keyword"},
    "severity": {"type": "keyword"},
    "entity_type": {"type": "keyword"},
    "entity_id": {"type": "keyword"},
    "triggered_at": {"type": "date"},
    "payload": {"type": "flattened"},
    "delivery_status": {"type": "nested", "properties": {"channel": {"type": "keyword"}, "status": {"type": "keyword"}, "delivered_at": {"type": "date"}}},
    "lineage": {
      "properties": {
        "source_name": {"type": "keyword"},
        "source_url": {"type": "keyword"},
        "timestamp": {"type": "date"},
        "verification_status": {"type": "keyword"}
      }
    }
  }
}
```

---

## Redis Cache Strategy

Redis supports ultra-low latency reads for market data, authorization lookups, and derived metrics. The cache is organised into logical keyspaces with standardised prefixes.

### Keyspaces

| Prefix | Purpose | Value Type | TTL |
|--------|---------|------------|-----|
| `md:price:{instrument_id}` | Latest L2 price snapshot (open/high/low/close/volume). | JSON (RedisJSON) | 5 seconds |
| `md:ohlc:{instrument_id}:{interval}` | Aggregated OHLC bars (1m, 5m, 1h). | Sorted Set keyed by epoch | 2 hours |
| `ref:instrument:{symbol}` | Instrument metadata for quick symbol resolution. | Hash | 24 hours |
| `portfolio:summary:{portfolio_id}` | Cached NAV & risk metrics for dashboards. | JSON | 5 minutes |
| `alerts:active:{tenant_id}` | List of active alert IDs. | Set | 10 minutes |
| `auth:session:{token}` | Auth session details (mirror of JWT claims). | Hash | Session expiry |

All cached objects include the lineage metadata under a `lineage` JSON key mirroring standard fields. Upstream services populate `lineage.timestamp` when pushing updates.

### Caching Policies

- **Write-through** for reference data (`ref:instrument`) ensuring cache coherency after database updates.
- **Write-behind** for computed metrics (`portfolio:summary`) where background jobs reconcile caches back to PostgreSQL/Timescale.
- **Event-driven invalidation** leveraging Kafka topics (`instrument.prices.updated`, `portfolio.valuations.updated`). Consumers purge or refresh relevant keys.

### Invalidation & Refresh

- Key expiries enforced using TTL; manual invalidation occurs on corporate actions (dividends, splits) to avoid stale valuations.
- Redis Keyspace Notifications trigger asynchronous refresh jobs for hot keys nearing expiry.
- Alerts caches clear on configuration updates to prevent inconsistent firing states.

---

## Analytics Warehouse Layout

The data warehouse (Snowflake / BigQuery equivalent) follows a hybrid architecture: conformed dimensions with wide fact tables to power BI/reporting workloads while preserving lineage.

### Dimensional Model

| Dimension | Grain | Key Attributes |
|-----------|-------|----------------|
| `dim_company` | Company | `company_id`, `legal_name`, `industry_sector`, `country_code`, lineage fields. |
| `dim_instrument` | Instrument | `instrument_id`, `instrument_type`, `primary_symbol`, `currency`, `company_id`. |
| `dim_date` | Day | Calendar attributes, fiscal variants. |
| `dim_holder` | Ownership holder | `holder_id`, `holder_type`, `registration_number`. |
| `dim_portfolio` | Portfolio | `portfolio_id`, `tenant_id`, `owner_type`, `risk_profile`. |
| `dim_alert` | Alert configuration | `alert_id`, `alert_type`, `severity`, `entity_type`. |
| `dim_report` | Report definition | `report_id`, `report_type`, scheduling metadata. |

All dimensions append lineage columns exactly as defined earlier and maintain SCD2 tracking via `effective_start`, `effective_end`, and `is_current` flags.

### Fact Tables

| Fact | Grain | Measures | Foreign Keys |
|------|-------|----------|--------------|
| `fact_market_price` | Instrument-Minute | `open`, `high`, `low`, `close`, `volume`, `oi` | `dim_instrument`, `dim_date`, `dim_company` |
| `fact_financial_statement` | Statement-Line Item | `value`, `as_reported`, `restated` | `dim_company`, `dim_date` (period end), `dim_report` (if generated report) |
| `fact_financial_ratio` | Company-Metric-Date | `ratio_value` | `dim_company`, `dim_date` |
| `fact_ownership` | Company-Holder-Quarter | `share_count`, `share_percentage` | `dim_company`, `dim_holder`, `dim_date` |
| `fact_portfolio_position` | Portfolio-Instrument-Day | `quantity`, `market_value`, `unrealized_pnl` | `dim_portfolio`, `dim_instrument`, `dim_date` |
| `fact_portfolio_transaction` | Transaction | `quantity`, `price`, `fees` | `dim_portfolio`, `dim_instrument`, `dim_date` |
| `fact_alert_event` | Alert Firing | `trigger_count`, `acknowledge_latency` | `dim_alert`, `dim_date`, `dim_portfolio` (if applicable), `dim_instrument` |
| `fact_report_run` | Report Execution | `execution_time`, `status_code` | `dim_report`, `dim_date` |
| `fact_audit_event` | Audit Action | counts | `dim_date`, `dim_portfolio` or `dim_company` depending on entity |

Warehouse facts store `lineage_source_name`, `lineage_source_url`, `lineage_timestamp`, `lineage_verification_status` columns to preserve origin across transformations.

### ETL, Data Quality & Lineage

- **Ingestion:** Change data capture (CDC) from PostgreSQL using Debezium feeds into Kafka, then persisted to the warehouse via stream loaders (Snowpipe/Kafka Connect). Timescale hypertables replicate using continuous aggregates to reduce volume.
- **Transformation:** dbt orchestrates transformations enforcing schema tests (unique constraints, non-null). Data quality anomalies automatically raise alerts via `fact_alert_event`.
- **Lineage Tracking:** OpenLineage integration attaches lineage metadata as run facets. Each ETL step maintains the four canonical fields; `lineage.timestamp` is set to the pipeline execution time.
- **Retention:** Warehouse retains 10 years of data; monthly partitions archived to cold storage beyond regulatory requirements.

---

## Appendix

### Lineage Verification Status Enumeration

| Value | Meaning | Allowed Transitions |
|-------|---------|---------------------|
| `RAW` | Freshly ingested, not yet processed. | `RAW` → `PARSED`, `RAW` → `SUPERSEDED`. |
| `PARSED` | Parsed/normalized but not cross-validated. | `PARSED` → `VERIFIED`, `PARSED` → `SUPERSEDED`. |
| `VERIFIED` | Validated against multiple sources / reconciled. | `VERIFIED` → `SUPERSEDED`. |
| `SUPERSEDED` | Obsolete due to restatement or newer data. | Terminal state. |

Services must implement validation to prevent downgrading from `VERIFIED` to `PARSED` without explicit override.

### Sample DDL Snippets

**Create verification status enum:**

```sql
CREATE TYPE verification_status_enum AS ENUM ('RAW', 'PARSED', 'VERIFIED', 'SUPERSEDED');
```

**Timescale continuous aggregate for instrument prices:**

```sql
CREATE MATERIALIZED VIEW cagg_instrument_prices_ohlc_daily
WITH (timescaledb.continuous) AS
SELECT
  instrument_id,
  time_bucket('1 day', bucketed_at) AS bucket_day,
  first(open, bucketed_at) AS open,
  max(high) AS high,
  min(low) AS low,
  last(close, bucketed_at) AS close,
  sum(volume) AS volume,
  max(oi) AS oi,
  max(source_name) AS source_name,
  max(source_url) AS source_url,
  max("timestamp") AS timestamp,
  max(verification_status) AS verification_status
FROM ts_instrument_prices
GROUP BY 1, 2;
```

**Audit partition management:**

```sql
CREATE TABLE audit_events_2024_10 PARTITION OF audit_events
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
ALTER TABLE audit_events_2024_10 ADD PRIMARY KEY (audit_event_id);
```

---

**Document Owner:** Data Architecture Team  
**Review Cadence:** Quarterly or upon major schema change.
