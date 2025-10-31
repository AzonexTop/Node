# Service Dependency Graph

This document provides a detailed visual representation of service dependencies and data flows in the AI-driven Indian markets platform.

---

## Visual Dependency Graph

### Legend

```
┌─────────┐
│ Service │  = Service/Component
└─────────┘

──────────> = Synchronous dependency (REST API call)
- - - - - > = Asynchronous dependency (Event/Message)
═════════> = Data flow
```

---

## Complete System Dependency Graph

```
                                    External Systems
┌────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐  ┌──────┐  ┌──────┐    │
│  │ NSE  │  │ BSE  │  │ MCX  │  │DigiLkr │  │Twilio│  │SendGd│    │
│  │ API  │  │ API  │  │ API  │  │  API   │  │ SMS  │  │Email │    │
│  └───┬──┘  └───┬──┘  └───┬──┘  └────┬───┘  └───┬──┘  └───┬──┘    │
└──────┼─────────┼─────────┼──────────┼──────────┼─────────┼────────┘
       │         │         │          │          │         │
       └─────────┴─────────┘          │          └────┬────┘
                 │                    │               │
                 ▼                    ▼               ▼
       ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐
       │Market Data       │  │   User      │  │   Alert &    │
       │Ingestion Service │  │ Management  │  │Notification  │
       │                  │  │  Service    │  │   Service    │
       └────────┬─────────┘  └──────┬──────┘  └──────▲───────┘
                │                   │                 │
                │                   ▼                 │
                │          ┌─────────────────┐       │
                │          │  Auth Service   │       │
                │          │  (Core Service) │       │
                │          └────────┬────────┘       │
                │                   │                │
                │                   │ JWT validation │
                │                   │                │
                ▼                   ▼                │
       ┌─────────────────────────────────────────┐  │
       │         Apache Kafka Event Bus          │  │
       │  ┌──────────────────────────────────┐   │  │
       │  │ Topics:                          │   │  │
       │  │ - market-data-raw                │   │  │
       │  │ - market-data-normalized         │   │  │
       │  │ - trading-signals                │───┼──┘
       │  │ - user-events                    │   │
       │  │ - audit-events                   │   │
       │  │ - alert-events                   │   │
       │  └──────────────────────────────────┘   │
       └─────────┬───────────────────────────────┘
                 │
     ┌───────────┼───────────────────┐
     │           │                   │
     ▼           ▼                   ▼
┌─────────┐ ┌─────────┐      ┌──────────────┐
│ Stream  │ │ Market  │      │   Trading    │
│Processor│ │  Data   │      │   Signal     │
│         │ │ Service │      │   Service    │
└────┬────┘ └────┬────┘      └──────┬───────┘
     │           │                   │
     │           │ Real-time quotes  │
     │           │                   │
     │           └──────────┬────────┘
     │                      │
     ▼                      ▼
┌─────────────┐      ┌──────────────┐       ┌──────────────┐
│  InfluxDB   │      │  Feature     │       │  Portfolio   │
│(Time-Series)│      │   Store      │       │  Management  │
└─────────────┘      │  Service     │       │   Service    │
                     └──────┬───────┘       └──────┬───────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐       ┌──────────────┐
                     │    Redis     │       │  PostgreSQL  │
                     │   (Cache)    │       │  (Primary    │
                     └──────────────┘       │   Database)  │
                                            └──────────────┘

Cross-Cutting Services (consume from all)
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Compliance & │  │  Analytics & │  │  Monitoring  │     │
│  │    Audit     │  │   Reporting  │  │     Stack    │     │
│  │   Service    │  │   Service    │  │ (Prometheus/ │     │
│  │              │  │              │  │   Grafana)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## Tiered Dependency Model

### Tier 0: Foundational Services (No Dependencies)

These services have no dependencies on other internal services:

1. **Auth Service**
   - Dependencies: PostgreSQL, Redis
   - Provides: JWT tokens, user authentication

2. **PostgreSQL Database**
   - Type: Data store
   - Dependencies: None
   - Provides: Persistent data storage

3. **Redis Cache**
   - Type: Data store
   - Dependencies: None
   - Provides: Caching, session storage

4. **Apache Kafka**
   - Type: Event bus
   - Dependencies: Zookeeper (internal)
   - Provides: Event streaming

5. **InfluxDB**
   - Type: Data store
   - Dependencies: None
   - Provides: Time-series data storage

**Startup Order**: 1 (Start first)

---

### Tier 1: Core Services

These services depend only on Tier 0:

1. **API Gateway**
   - Dependencies:
     - Auth Service (JWT validation)
   - Provides: Request routing, rate limiting

2. **User Management Service**
   - Dependencies:
     - Auth Service (authentication)
     - PostgreSQL (user data)
     - S3 (document storage)
   - Provides: User profiles, KYC

3. **Market Data Ingestion Service**
   - Dependencies:
     - Kafka (publishing market data)
     - External: NSE/BSE/MCX APIs
   - Provides: Real-time market data ingestion

**Startup Order**: 2

---

### Tier 2: Processing Services

These services depend on Tier 0 and Tier 1:

1. **Market Data Service**
   - Dependencies:
     - Kafka (consuming market data)
     - InfluxDB (storing/querying time-series)
     - Redis (caching quotes)
   - Provides: Real-time quotes, historical data

2. **Stream Processor**
   - Dependencies:
     - Kafka (consuming/producing)
     - InfluxDB (storing processed data)
   - Provides: Data normalization, aggregations

3. **Feature Store Service**
   - Dependencies:
     - Market Data Service (feature computation)
     - Redis (online features)
     - S3 (offline features)
   - Provides: Feature serving for ML

**Startup Order**: 3

---

### Tier 3: Business Logic Services

These services depend on Tier 0, 1, and 2:

1. **Trading Signal Service**
   - Dependencies:
     - Market Data Service (real-time data)
     - Feature Store Service (features)
     - S3 (model artifacts)
     - Kafka (publishing signals)
   - Provides: AI-powered trading signals

2. **Portfolio Management Service**
   - Dependencies:
     - Auth Service (authorization)
     - Market Data Service (quotes)
     - User Management Service (user data)
     - PostgreSQL (portfolio data)
   - Provides: Portfolio tracking, P&L

3. **Backtesting Service**
   - Dependencies:
     - Market Data Service (historical data)
     - S3 (simulation results)
   - Provides: Strategy backtesting

**Startup Order**: 4

---

### Tier 4: Notification Services

These services depend on all previous tiers:

1. **Alert & Notification Service**
   - Dependencies:
     - User Management Service (user preferences)
     - Trading Signal Service (signals)
     - Portfolio Management Service (P&L alerts)
     - Market Data Service (price alerts)
     - Kafka (alert events)
     - External: Twilio, SendGrid, FCM
   - Provides: Multi-channel notifications

**Startup Order**: 5

---

### Tier 5: Cross-Cutting Services

These services consume from all tiers:

1. **Compliance & Audit Service**
   - Dependencies:
     - Kafka (all audit events)
     - PostgreSQL (audit logs)
     - Elasticsearch (log indexing)
   - Provides: Audit trail, compliance reports

2. **Analytics & Reporting Service**
   - Dependencies:
     - All services (data aggregation)
     - PostgreSQL (read replica)
     - ClickHouse (OLAP)
   - Provides: Reports, analytics

3. **Monitoring Service**
   - Dependencies:
     - All services (metrics, logs)
     - Prometheus (metrics storage)
     - Jaeger (traces)
   - Provides: Observability

**Startup Order**: Last (6)

---

## Data Flow Diagrams

### Real-Time Market Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Data Ingestion                                           │
└──────────────────────────────────────────────────────────────────┘

NSE WebSocket ══> Market Data Ingestion Service
                           │
                           │ Validate & Parse
                           ▼
                  Kafka: market-data-raw
                           │
                           │ Partition by symbol
                           ▼
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
            Consumer Group 1   Consumer Group 2
         (Stream Processor) (Market Data Service)


┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Data Processing                                          │
└──────────────────────────────────────────────────────────────────┘

Stream Processor
    │
    ├──> Normalize format
    ├──> Calculate OHLCV
    ├──> Detect anomalies
    └──> Publish to Kafka: market-data-normalized
              │
              ▼
         InfluxDB (store)


┌──────────────────────────────────────────────────────────────────┐
│ Step 3: Data Serving                                             │
└──────────────────────────────────────────────────────────────────┘

Market Data Service
    │
    ├──> Store in Redis (cache with TTL 5s)
    ├──> Store in InfluxDB (time-series)
    └──> Push to WebSocket clients
              │
              ▼
         Web/Mobile App (real-time update)


┌──────────────────────────────────────────────────────────────────┐
│ Latency Breakdown                                                │
└──────────────────────────────────────────────────────────────────┘

NSE → Ingestion Service:     10-20ms
Ingestion → Kafka:            5-10ms
Kafka → Stream Processor:    10-20ms
Stream Processor → Kafka:     5-10ms
Kafka → Market Data Service: 10-20ms
Market Data Service → Client: 20-30ms
──────────────────────────────────────
Total (p95):                 60-110ms ✓ (Target: <100ms)
```

### Trading Signal Generation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Trigger (every 5 minutes during market hours)           │
└──────────────────────────────────────────────────────────────────┘

Scheduler (Cron)
    │
    ▼
Trading Signal Service (receives trigger)


┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Data Gathering                                           │
└──────────────────────────────────────────────────────────────────┘

Trading Signal Service
    │
    ├──> Request historical data (1 day)
    │    └──> Market Data Service
    │             └──> InfluxDB
    │
    ├──> Request features
    │    └──> Feature Store Service
    │             └──> Redis (online features)
    │
    └──> Request news sentiment (optional)
         └──> Analytics Service


┌──────────────────────────────────────────────────────────────────┐
│ Step 3: Signal Computation                                       │
└──────────────────────────────────────────────────────────────────┘

Trading Signal Service
    │
    ├──> Compute technical indicators (RSI, MACD, etc.)
    │    └──> Use Pandas/TA-Lib (in-memory)
    │
    ├──> Run ML model inference
    │    └──> Load model from S3 (cached)
    │    └──> TorchServe / TF Serving
    │
    ├──> Combine signals (ensemble)
    └──> Calculate confidence score


┌──────────────────────────────────────────────────────────────────┐
│ Step 4: Signal Publishing                                        │
└──────────────────────────────────────────────────────────────────┘

Trading Signal Service
    │
    ├──> Publish to Kafka: trading-signals
    │    └──> Key: symbol, Value: {signal, confidence, timestamp}
    │
    └──> Store in PostgreSQL (signal history)


┌──────────────────────────────────────────────────────────────────┐
│ Step 5: Signal Distribution                                      │
└──────────────────────────────────────────────────────────────────┘

Kafka: trading-signals
    │
    ├──────────────────┬──────────────────┬─────────────────┐
    │                  │                  │                 │
    ▼                  ▼                  ▼                 ▼
Alert Service   Portfolio Service   Analytics Service   Web App
    │
    │ (if high confidence)
    ▼
Send notification to user


┌──────────────────────────────────────────────────────────────────┐
│ Latency Breakdown                                                │
└──────────────────────────────────────────────────────────────────┘

Data gathering:          500-1000ms
Technical analysis:      100-200ms
ML inference:            500-1500ms
Signal publishing:       50-100ms
───────────────────────────────────
Total (p95):            1500-3000ms ✓ (Target: <5s)
```

### User Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: User Login                                               │
└──────────────────────────────────────────────────────────────────┘

Web/Mobile App
    │
    │ POST /auth/login {email, password}
    ▼
API Gateway
    │
    │ Route to Auth Service
    ▼
Auth Service


┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Credential Verification                                  │
└──────────────────────────────────────────────────────────────────┘

Auth Service
    │
    ├──> Query user from PostgreSQL
    │    └──> SELECT * FROM users WHERE email = ?
    │
    ├──> Compare password hash (bcrypt)
    │
    └──> If 2FA enabled
         └──> Send OTP via Alert Service
         └──> Wait for OTP verification


┌──────────────────────────────────────────────────────────────────┐
│ Step 3: Session Creation                                         │
└──────────────────────────────────────────────────────────────────┘

Auth Service
    │
    ├──> Generate JWT token (15min expiry)
    │    └──> Payload: {user_id, role, permissions}
    │
    ├──> Generate refresh token (30 days expiry)
    │
    ├──> Store session in Redis
    │    └──> Key: session:{session_id}
    │    └──> Value: {user_id, device, ip}
    │    └──> TTL: 30 days
    │
    └──> Log audit event
         └──> Kafka: audit-events (LOGIN_SUCCESS)


┌──────────────────────────────────────────────────────────────────┐
│ Step 4: Response                                                 │
└──────────────────────────────────────────────────────────────────┘

Auth Service
    │
    │ Return {access_token, refresh_token}
    ▼
API Gateway
    │
    ▼
Web/Mobile App
    │
    └──> Store tokens in secure storage
         └──> Web: HttpOnly cookie + localStorage
         └──> Mobile: Keychain/Keystore


┌──────────────────────────────────────────────────────────────────┐
│ Step 5: Authenticated Request                                    │
└──────────────────────────────────────────────────────────────────┘

Web/Mobile App
    │
    │ GET /portfolio {Authorization: Bearer <JWT>}
    ▼
API Gateway
    │
    ├──> Validate JWT signature
    ├──> Check expiry
    └──> Extract user_id and role
    │
    │ Forward request with user context
    ▼
Portfolio Service
    │
    └──> Use user_id to fetch portfolio
```

---

## Service Communication Matrix

| From \ To | Auth | User Mgmt | Market Data | Trading Signal | Portfolio | Alert | Compliance |
|-----------|------|-----------|-------------|----------------|-----------|-------|------------|
| **API Gateway** | ✓ Sync | ✓ Sync | ✓ Sync | ✓ Sync | ✓ Sync | ✓ Sync | ✓ Sync |
| **User Mgmt** | ✓ Sync | - | - | - | - | - | ✗ Async |
| **Market Data** | - | - | - | - | - | - | ✗ Async |
| **Trading Signal** | - | - | ✓ Sync | - | - | - | ✗ Async |
| **Portfolio** | ✓ Sync | ✓ Sync | ✓ Sync | ✗ Async | - | - | ✗ Async |
| **Alert** | - | ✓ Sync | ✓ Sync | ✗ Async | ✗ Async | - | ✗ Async |
| **Compliance** | - | - | - | - | - | - | - |

**Legend**:
- ✓ Sync: Synchronous REST API call
- ✗ Async: Asynchronous via Kafka
- -: No direct communication

---

## Kafka Topic Dependency Map

```
Producers                Topics                    Consumers
──────────────────────────────────────────────────────────────────

Market Data         ──> market-data-raw      ──> Stream Processor
Ingestion                                    ──> Market Data Service
                                             ──> Compliance Service

Stream Processor    ──> market-data-         ──> Trading Signal Service
                        normalized           ──> Analytics Service
                                             ──> Feature Store Service

Trading Signal      ──> trading-signals      ──> Alert Service
Service                                      ──> Portfolio Service
                                             ──> Analytics Service
                                             ──> Compliance Service

Auth Service        ──> user-events          ──> Compliance Service
User Management                              ──> Analytics Service
Service

All Services        ──> audit-events         ──> Compliance Service
                                             ──> Analytics Service

Alert Service       ──> alert-events         ──> Notification Workers
                                             ──> Analytics Service
```

---

## Critical Path Identification

### Path 1: Market Data to User (Real-Time Quote)

```
NSE API → Market Data Ingestion → Kafka → Market Data Service → Redis → API Gateway → Web App

Criticality: HIGH
Latency Target: < 100ms
Failure Impact: Users see stale quotes
Mitigation: Multiple ingestion instances, Redis fallback
```

### Path 2: Market Data to Signal Generation

```
NSE API → Market Data Ingestion → Kafka → Stream Processor → InfluxDB
                                                              ↓
Trading Signal Service ← Feature Store ← [Scheduled Trigger]

Criticality: HIGH
Latency Target: < 5s
Failure Impact: No new signals generated
Mitigation: Fallback to technical analysis only
```

### Path 3: Signal to User Notification

```
Trading Signal Service → Kafka → Alert Service → Twilio/FCM → User Device

Criticality: MEDIUM
Latency Target: < 30s
Failure Impact: Delayed alerts
Mitigation: Retry mechanism, multiple notification channels
```

### Path 4: User Authentication

```
Web App → API Gateway → Auth Service → PostgreSQL → Redis

Criticality: CRITICAL
Latency Target: < 200ms
Failure Impact: Users cannot login/access platform
Mitigation: Multi-instance Auth Service, Redis fallback
```

---

## Failure Impact Analysis

### Scenario 1: Auth Service Failure

**Impact**:
- New logins: ❌ Blocked
- Existing sessions: ✅ Continue (JWT is stateless)
- Token refresh: ❌ Blocked

**Cascading Failures**:
- None (other services continue with cached tokens)

**Recovery**:
- Auto-restart pod (30 seconds)
- Standby pod takes over immediately

**Data Loss**: None

---

### Scenario 2: Market Data Ingestion Failure

**Impact**:
- Real-time quotes: ❌ Stale data
- Trading signals: ❌ No new signals
- Portfolio P&L: ⚠️ Delayed updates

**Cascading Failures**:
- Trading Signal Service (no new data)
- Alert Service (no price alerts)

**Recovery**:
- Automatic reconnection to exchange (1 minute)
- Secondary ingestion service takes over
- Historical data backfill after recovery

**Data Loss**: Minimal (can backfill from exchange)

---

### Scenario 3: PostgreSQL Primary Failure

**Impact**:
- Writes: ❌ All write operations fail
- Reads: ✅ Read replicas continue

**Cascading Failures**:
- User registration: ❌
- Portfolio updates: ❌
- Audit logs: ❌ (buffered in Kafka)

**Recovery**:
- Auto-failover to standby (60 seconds)
- Read replicas promoted to primary

**Data Loss**: < 5 minutes (replication lag)

---

### Scenario 4: Kafka Broker Failure

**Impact**:
- Event publishing: ⚠️ Slowed (other brokers take over)
- Event consumption: ✅ Consumers rebalance

**Cascading Failures**:
- None (Kafka cluster handles broker failure)

**Recovery**:
- Automatic rebalancing (2 minutes)
- Replace failed broker

**Data Loss**: None (replication factor 3)

---

## Dependency Health Monitoring

### Health Check Strategy

Each service exposes health endpoints:

```
GET /health
{
  "status": "healthy",
  "dependencies": {
    "database": "healthy",
    "cache": "healthy",
    "kafka": "healthy"
  },
  "uptime": 3600,
  "version": "1.2.3"
}

GET /ready
{
  "ready": true,
  "checks": {
    "database_connection": true,
    "kafka_connection": true,
    "external_api": true
  }
}
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 2
```

### Dependency Circuit Breakers

Each service implements circuit breakers for external dependencies:

```typescript
// Example: Circuit breaker for Market Data Service
const circuitBreaker = new CircuitBreaker(marketDataService.getQuote, {
  timeout: 3000, // 3 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
  fallback: () => getCachedQuote() // Return cached data
});
```

---

## Deployment Order

When deploying the entire system from scratch:

1. **Infrastructure** (Tier 0)
   - PostgreSQL
   - Redis
   - Kafka + Zookeeper
   - InfluxDB
   - S3

2. **Core Services** (Tier 1)
   - Auth Service
   - API Gateway

3. **Data Ingestion** (Tier 2)
   - Market Data Ingestion Service
   - Stream Processor

4. **Data Serving** (Tier 2)
   - Market Data Service
   - Feature Store Service

5. **Business Logic** (Tier 3)
   - User Management Service
   - Trading Signal Service
   - Portfolio Management Service
   - Backtesting Service

6. **Notifications** (Tier 4)
   - Alert & Notification Service

7. **Cross-Cutting** (Tier 5)
   - Compliance Service
   - Analytics Service
   - Monitoring Service

8. **Frontend**
   - Web Application
   - Admin Dashboard

**Total Startup Time**: ~10 minutes (with health checks)

---

## Appendix: Dependency Commands

### Check Service Dependencies

```bash
# List all services and their dependencies
kubectl get deployments -n production -o json | \
  jq '.items[] | {name: .metadata.name, dependencies: .spec.template.metadata.annotations.dependencies}'

# Check if a service is ready
kubectl get pods -n production -l app=market-data-service -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}'

# View dependency health from a service
curl https://api.example.com/market-data/health | jq '.dependencies'
```

### Trace Request Flow

```bash
# Get Jaeger trace for a request
curl -G https://jaeger.example.com/api/traces \
  --data-urlencode 'service=api-gateway' \
  --data-urlencode 'operation=GET /portfolio' \
  --data-urlencode 'limit=1'
```

---

**Document Version**: 1.0  
**Last Updated**: 2024-11  
**Related**: `PLATFORM_BLUEPRINT.md`, `disaster-recovery.md`
