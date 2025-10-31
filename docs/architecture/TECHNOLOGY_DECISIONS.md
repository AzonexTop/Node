# Technology Decision Record (TDR)

This document captures the key technology decisions made for the AI-driven Indian markets platform, including the rationale, alternatives considered, and trade-offs.

---

## Table of Contents

1. [Frontend Stack](#frontend-stack)
2. [Backend Stack](#backend-stack)
3. [Data Storage](#data-storage)
4. [AI/ML Stack](#aiml-stack)
5. [Infrastructure](#infrastructure)
6. [Third-Party Services](#third-party-services)

---

## Frontend Stack

### TDR-001: Next.js for Web Application

**Decision**: Use Next.js 14 as the primary web framework

**Status**: ✅ Approved

**Context**:
- Need server-side rendering for SEO and initial load performance
- Real-time updates for market data
- Complex state management requirements
- Mobile-responsive design

**Alternatives Considered**:

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Next.js 14** | SSR/SSG, React Server Components, Edge functions, API routes, optimized builds | Learning curve, vendor lock-in (Vercel) | ✅ **Selected** |
| **Create React App** | Simple, well-known | No SSR, outdated, maintenance mode | ❌ Rejected |
| **Remix** | Better data loading, web standards | Smaller ecosystem, newer | ❌ Rejected |
| **SvelteKit** | Better performance, smaller bundle | Smaller ecosystem, less talent | ❌ Rejected |
| **Angular** | Full framework, TypeScript-first | Heavy, opinionated, learning curve | ❌ Rejected |

**Rationale**:
- **Server-Side Rendering**: Critical for SEO and initial page load performance (target: < 1.5s FCP)
- **React Server Components**: Reduces client bundle size, better performance
- **Edge Functions**: Low-latency API routes deployed globally
- **Image Optimization**: Automatic image optimization for financial charts
- **Large Ecosystem**: Extensive library support for charts, forms, etc.
- **Developer Experience**: Fast refresh, TypeScript support, great tooling

**Consequences**:
- ✅ Excellent performance and SEO
- ✅ Good developer experience
- ⚠️ Vercel vendor lock-in (mitigated by self-hosting option)
- ⚠️ Server component paradigm has learning curve

**Implementation Notes**:
- Use App Router (not Pages Router) for React Server Components
- Deploy on Vercel for optimal performance, or self-host on AWS ECS/EKS
- Configure CDN (CloudFront/Cloudflare) for static assets

---

### TDR-002: TradingView Lightweight Charts for Financial Visualization

**Decision**: Use TradingView Lightweight Charts library

**Status**: ✅ Approved

**Context**:
- Need high-performance, real-time financial charts
- Support for candlestick, line, area charts
- Technical indicators overlay
- Mobile responsive

**Alternatives Considered**:

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **TradingView Lightweight Charts** | Designed for finance, high performance, free | Less customizable | ✅ **Selected** |
| **Recharts** | React-native, highly customizable | Performance issues with real-time | ❌ Rejected |
| **Chart.js** | Popular, flexible | Not optimized for finance | ❌ Rejected |
| **D3.js** | Fully customizable | Complex, time-consuming | ❌ Rejected |
| **ApexCharts** | Modern, good UX | Performance with large datasets | ❌ Rejected |

**Rationale**:
- **Performance**: Can handle 100K+ data points with smooth rendering
- **Financial Focus**: Built-in support for OHLCV, candlesticks, volume
- **Real-Time**: Optimized for streaming data updates
- **Mobile Support**: Touch gestures, responsive
- **Free**: Apache 2.0 license, no cost

**Consequences**:
- ✅ Excellent performance for real-time market data
- ✅ Professional financial chart appearance
- ⚠️ Limited customization beyond financial use cases

---

### TDR-003: Zustand + React Query for State Management

**Decision**: Use Zustand for client state, React Query for server state

**Status**: ✅ Approved

**Context**:
- Need lightweight state management
- Separate client state (UI) from server state (API data)
- Real-time updates for market data

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Zustand + React Query** | Lightweight, separation of concerns | Need two libraries | ✅ **Selected** |
| **Redux Toolkit** | Industry standard, mature, DevTools | Boilerplate, overkill for our needs | ❌ Rejected |
| **Jotai** | Atomic, minimal | Less mature, smaller community | ❌ Rejected |
| **Recoil** | Atomic, by Facebook | Experimental, unstable API | ❌ Rejected |
| **Context API only** | Built-in, no dependencies | Performance issues, no caching | ❌ Rejected |

**Rationale**:
- **Zustand**: Minimal boilerplate, 1KB size, easy to use, TypeScript support
- **React Query**: Best-in-class server state management, automatic caching, background refetching
- **Separation of Concerns**: Client state (theme, UI) vs server state (market data, portfolios)
- **Developer Experience**: Simple API, great DevTools

**Consequences**:
- ✅ Minimal bundle size impact
- ✅ Clear separation between client and server state
- ✅ Automatic cache invalidation and refetching
- ⚠️ Team needs to learn two state management patterns

**Implementation Notes**:
```typescript
// Client state with Zustand
const useUIStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme })
}));

// Server state with React Query
const { data, isLoading } = useQuery(['portfolio'], fetchPortfolio, {
  staleTime: 5000,
  refetchInterval: 5000
});
```

---

## Backend Stack

### TDR-004: Node.js + Express for General-Purpose APIs

**Decision**: Use Node.js with Express for most backend services

**Status**: ✅ Approved

**Context**:
- Need fast, scalable API services
- Real-time WebSocket support
- JSON-heavy workloads
- Team expertise

**Alternatives Considered**:

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Node.js + Express** | Mature, vast ecosystem, non-blocking I/O | Single-threaded CPU bottleneck | ✅ **Selected** |
| **Nest.js** | TypeScript-first, modular, dependency injection | Opinionated, larger bundle | ⚠️ Consider for complex services |
| **Fastify** | Faster than Express, schema validation | Smaller ecosystem | ⚠️ Consider for high-throughput |
| **Go + Gin** | High performance, compiled | Less talent, different language | ❌ Rejected |
| **Java + Spring Boot** | Enterprise-grade, mature | Heavy, slow startup, verbose | ❌ Rejected |

**Rationale**:
- **Non-Blocking I/O**: Excellent for I/O-bound operations (API calls, database queries)
- **Ecosystem**: Largest package ecosystem (npm), extensive middleware
- **WebSocket Support**: First-class support via Socket.io
- **JSON Performance**: Native JSON handling
- **Team Expertise**: Most JavaScript/TypeScript developers know Node.js
- **Monorepo Friendly**: Share TypeScript types between frontend and backend

**Consequences**:
- ✅ Fast development, code reuse with frontend
- ✅ Excellent for real-time features
- ⚠️ Not ideal for CPU-intensive tasks (use Python/Go for those)
- ⚠️ Callback hell (mitigated with async/await)

**Implementation Notes**:
- Use TypeScript for type safety
- Use Fastify for high-throughput services (Market Data Service)
- Use clustering for CPU-bound operations
- Offload heavy computation to Python services

---

### TDR-005: Python + FastAPI for Data-Intensive and AI Services

**Decision**: Use Python with FastAPI for data pipelines and AI/ML services

**Status**: ✅ Approved

**Context**:
- Need to process large datasets (time-series market data)
- Run machine learning models
- Integrate with data science libraries (Pandas, NumPy, scikit-learn)
- Need high-performance API framework

**Alternatives Considered**:

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Python + FastAPI** | Async, fast, auto-docs, type hints | Newer framework | ✅ **Selected** |
| **Python + Flask** | Mature, simple, flexible | Synchronous by default, slower | ❌ Rejected |
| **Python + Django** | Full-featured, ORM, admin | Heavy, opinionated, overkill | ❌ Rejected |
| **Node.js** | Same language as other services | Poor ML ecosystem | ❌ Rejected |

**Rationale**:
- **ML Ecosystem**: Python is the de facto language for ML (TensorFlow, PyTorch, scikit-learn)
- **Data Processing**: Pandas, NumPy, Polars for efficient data manipulation
- **FastAPI Performance**: Comparable to Node.js/Go (Starlette + Pydantic)
- **Async Support**: First-class async/await for concurrent operations
- **Type Safety**: Pydantic models for request/response validation
- **Auto-Documentation**: Automatic OpenAPI/Swagger docs

**Consequences**:
- ✅ Best-in-class ML and data processing capabilities
- ✅ High performance with async
- ✅ Type safety and auto-docs
- ⚠️ Different language than frontend (no code sharing)
- ⚠️ Need Python expertise on team

**Use Cases**:
- Market Data Ingestion Service
- Trading Signal Service (ML inference)
- Model Training Service
- Backtesting Service
- Analytics Service

---

### TDR-006: Microservices Architecture with Event-Driven Design

**Decision**: Adopt microservices architecture with event-driven patterns

**Status**: ✅ Approved

**Context**:
- Need to scale services independently
- Different services have different resource requirements (CPU vs GPU)
- Multiple teams working on different features
- Real-time event processing requirements

**Alternatives Considered**:

| Architecture | Pros | Cons | Decision |
|--------------|------|------|----------|
| **Microservices (Event-Driven)** | Independent scaling, loose coupling, polyglot | Complexity, distributed systems challenges | ✅ **Selected** |
| **Monolith** | Simple, easy to develop initially | Scaling issues, tight coupling | ❌ Rejected |
| **Modular Monolith** | Simpler than microservices, better than monolith | Still shares resources, single deployment | ⚠️ Consider for MVP |
| **Serverless (FaaS)** | Auto-scaling, pay-per-use | Cold starts, vendor lock-in, hard to debug | ⚠️ Consider for specific workloads |

**Rationale**:
- **Independent Scaling**: Market Data Service needs more resources than others
- **Technology Diversity**: Use best tool for each service (Node.js, Python, Go)
- **Fault Isolation**: One service failure doesn't bring down entire platform
- **Team Autonomy**: Teams can deploy services independently
- **Event-Driven**: Natural fit for real-time market data, alerts, signals
- **Future-Proof**: Easier to add new services as platform grows

**Consequences**:
- ✅ Scalability and flexibility
- ✅ Technology freedom
- ⚠️ Increased operational complexity (need strong DevOps)
- ⚠️ Distributed tracing, monitoring required
- ⚠️ Network latency between services
- ⚠️ Data consistency challenges

**Mitigation Strategies**:
- Use Kubernetes for orchestration
- Implement service mesh (Istio) for observability
- Use Saga pattern for distributed transactions
- Comprehensive monitoring and tracing (Prometheus, Jaeger)
- Start with fewer, larger services and split as needed

---

## Data Storage

### TDR-007: PostgreSQL as Primary Relational Database

**Decision**: Use PostgreSQL 15+ as the primary relational database

**Status**: ✅ Approved

**Context**:
- Need ACID guarantees for financial data
- Complex relational queries (portfolios, users, signals)
- JSON support for flexible schemas
- Full-text search capabilities

**Alternatives Considered**:

| Database | Pros | Cons | Decision |
|----------|------|------|----------|
| **PostgreSQL** | ACID, JSON support, mature, open-source, full-featured | Harder to scale writes | ✅ **Selected** |
| **MySQL** | Popular, mature, simple | Less advanced features, weaker JSON support | ❌ Rejected |
| **MongoDB** | Flexible schema, scalable | No ACID (without transactions), not ideal for financial | ❌ Rejected |
| **CockroachDB** | Distributed, PostgreSQL-compatible | Newer, more expensive, overkill | ⚠️ Consider for multi-region |

**Rationale**:
- **ACID Compliance**: Critical for financial transactions and portfolio data
- **Data Integrity**: Foreign keys, constraints, transactions
- **JSON Support**: Native JSONB for flexible data (signals metadata)
- **Full-Text Search**: Built-in FTS for symbol search, news
- **Advanced Features**: Window functions, CTEs, materialized views
- **Extensions**: PostGIS (future), pg_cron, timescaledb (time-series)
- **Open Source**: No licensing costs, large community

**Consequences**:
- ✅ Strong data integrity and consistency
- ✅ Powerful query capabilities
- ✅ No licensing costs
- ⚠️ Vertical scaling limits (mitigated with read replicas, sharding)
- ⚠️ More complex to scale than NoSQL

**Scaling Strategy**:
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Partitioning for large tables (audit logs by date)
- Consider sharding by user_id for portfolios at scale

---

### TDR-008: InfluxDB for Time-Series Market Data

**Decision**: Use InfluxDB (or TimescaleDB) for time-series market data

**Status**: ✅ Approved (InfluxDB primary, TimescaleDB alternative)

**Context**:
- Need to store tick-by-tick market data (100K+ events/sec)
- Efficient querying of time-range data
- Automatic downsampling and retention policies
- High write throughput

**Alternatives Considered**:

| Database | Pros | Cons | Decision |
|----------|------|------|----------|
| **InfluxDB** | Purpose-built for time-series, high write throughput, compression | Separate database to manage | ✅ **Selected** |
| **TimescaleDB** | PostgreSQL extension, SQL, ACID | Slower than InfluxDB for pure time-series | ⚠️ Strong alternative |
| **PostgreSQL** | Already using, one less system | Not optimized for time-series, slower | ❌ Rejected |
| **Cassandra** | Highly scalable, distributed | Complex, overkill, eventual consistency | ❌ Rejected |
| **ClickHouse** | Fast analytics, compression | Write performance lower, complex | ⚠️ Consider for analytics |

**Rationale**:
- **Write Performance**: Optimized for high-frequency writes (100K/sec)
- **Compression**: 10-20x compression for time-series data
- **Downsampling**: Automatic aggregation (1-min candles from tick data)
- **Retention Policies**: Automatic deletion of old data
- **Query Performance**: Optimized for time-range queries
- **Purpose-Built**: Designed specifically for time-series data

**Consequences**:
- ✅ Excellent write and query performance for market data
- ✅ Efficient storage with compression
- ✅ Built-in downsampling and retention
- ⚠️ Another database to manage and monitor
- ⚠️ InfluxQL learning curve (not SQL)

**Alternative: TimescaleDB**
- Pros: SQL, ACID, PostgreSQL ecosystem
- Cons: Slightly slower than InfluxDB
- Use Case: If we want to consolidate databases and can accept slightly lower performance

**Data Flow**:
```
Market Data Ingestion → Kafka → Stream Processor → InfluxDB
                                                  ↓
                                        1-sec, 1-min, 1-hour candles
```

---

### TDR-009: Redis for Caching and Real-Time Data

**Decision**: Use Redis for caching, session storage, and real-time features

**Status**: ✅ Approved

**Context**:
- Need sub-millisecond read latency for quotes
- Session storage for authentication
- Pub/sub for real-time updates
- Rate limiting

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Redis** | Fast, versatile, rich data structures, pub/sub | In-memory (limited by RAM) | ✅ **Selected** |
| **Memcached** | Simple, fast | Limited data structures, no persistence | ❌ Rejected |
| **Valkey** | Redis fork, open-source | Newer, less proven | ⚠️ Monitor |
| **Application-level cache** | No extra infrastructure | Limited, not shared across instances | ❌ Rejected |

**Rationale**:
- **Performance**: < 1ms read latency (p99)
- **Data Structures**: Strings, hashes, lists, sets, sorted sets
- **Pub/Sub**: Real-time updates to clients (WebSocket backend)
- **Session Storage**: Fast session retrieval for authentication
- **Rate Limiting**: Token bucket with INCR and EXPIRE
- **Cache Aside Pattern**: Cache frequently accessed data (quotes, user profiles)
- **Persistence**: AOF/RDB for durability

**Consequences**:
- ✅ Excellent performance for hot data
- ✅ Versatile for multiple use cases
- ⚠️ Limited by available RAM
- ⚠️ Need replication for HA
- ⚠️ Cache invalidation complexity

**Use Cases**:
- Real-time quotes (TTL: 5 seconds)
- User sessions (TTL: 30 days)
- Rate limiting counters (TTL: 1 hour)
- Pub/sub for WebSocket updates
- Feature flags (TTL: 5 minutes)

**Configuration**:
- Redis Cluster for horizontal scaling
- Replication (1 primary + 2 replicas)
- AOF persistence for durability
- Eviction policy: `allkeys-lru` (least recently used)

---

### TDR-010: Apache Kafka for Event Streaming

**Decision**: Use Apache Kafka as the event streaming platform

**Status**: ✅ Approved

**Context**:
- Need durable event log
- Multiple consumers for same events
- High throughput (100K+ events/sec)
- Event sourcing and CQRS patterns

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Apache Kafka** | High throughput, durable, mature, ecosystem | Complex to operate | ✅ **Selected** |
| **RabbitMQ** | Easy to use, good for traditional queuing | Lower throughput, not event log | ❌ Rejected |
| **AWS Kinesis** | Managed, easy to use | Vendor lock-in, higher cost, limited features | ⚠️ Consider for AWS-only |
| **Redis Streams** | Simple, already using Redis | Limited throughput, not designed for high volume | ❌ Rejected |
| **NATS** | Simple, fast, lightweight | Less mature ecosystem | ❌ Rejected |

**Rationale**:
- **Event Log**: Durable, ordered log of events (audit trail)
- **Multiple Consumers**: Many services can consume same events independently
- **High Throughput**: Can handle 100K+ events/sec per broker
- **Replay**: Consumers can replay events from any point
- **Partitioning**: Scalability through topic partitions
- **Ecosystem**: Kafka Connect, Schema Registry, Kafka Streams
- **Battle-Tested**: Used by thousands of companies at scale

**Consequences**:
- ✅ Scalable, durable event streaming
- ✅ Event sourcing and audit trail
- ✅ Decoupling between producers and consumers
- ⚠️ Operational complexity (need Kafka expertise)
- ⚠️ Requires Zookeeper (KRaft mode in Kafka 3.3+)
- ⚠️ Message ordering only within partitions

**Topic Design**:
- `market-data-raw`: Raw market data from exchanges (10 partitions)
- `market-data-normalized`: Processed market data (10 partitions)
- `trading-signals`: AI-generated signals (5 partitions)
- `user-events`: User actions (3 partitions)
- `audit-events`: Audit logs (5 partitions)
- `alert-events`: Alerts to be sent (3 partitions)

**Configuration**:
- 3 brokers minimum (5 for production)
- Replication factor: 3
- Min in-sync replicas: 2
- Retention: Varies by topic (7 days to 7 years)
- Compression: LZ4

---

## AI/ML Stack

### TDR-011: PyTorch for Deep Learning

**Decision**: Use PyTorch as the primary deep learning framework

**Status**: ✅ Approved

**Context**:
- Need to train custom ML models for price prediction
- Time-series forecasting (LSTM, Transformers)
- Research-friendly for experimentation
- Production deployment requirements

**Alternatives Considered**:

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **PyTorch** | Research-friendly, Pythonic, dynamic graphs, large community | Historically weaker production tools | ✅ **Selected** |
| **TensorFlow** | Production-ready, TF Serving, larger ecosystem | Less intuitive, complex API | ⚠️ Consider for specific models |
| **JAX** | Fastest, functional, JIT compilation | Smaller ecosystem, steeper learning curve | ❌ Rejected |
| **scikit-learn** | Simple, great for classical ML | No deep learning support | ✅ Use for classical ML |

**Rationale**:
- **Developer Experience**: Pythonic, intuitive API, easy debugging
- **Research Community**: Most ML research papers release PyTorch code
- **Flexibility**: Dynamic computation graphs, easy experimentation
- **Production Tools**: TorchServe, TorchScript for deployment
- **Ecosystem**: Hugging Face, PyTorch Lightning, large community
- **Time-Series Support**: Good libraries for sequence models (LSTM, GRU, Transformers)

**Consequences**:
- ✅ Fast experimentation and research
- ✅ Large community and resources
- ✅ Good production deployment with TorchServe
- ⚠️ Need to learn PyTorch ecosystem
- ⚠️ TensorFlow Serving is more mature (but TorchServe is catching up)

**Model Types**:
- LSTM/GRU for time-series forecasting
- Transformer models for price prediction
- Random Forest/XGBoost for classification (scikit-learn)
- Gradient Boosting for volatility prediction

**Deployment**:
- TorchServe for model serving (HTTP/gRPC)
- TorchScript for model optimization
- ONNX for cross-framework compatibility (if needed)

---

### TDR-012: Feast for Feature Store

**Decision**: Use Feast as the feature store

**Status**: ✅ Approved

**Context**:
- Need centralized feature management
- Online (real-time) and offline (batch) feature serving
- Feature versioning and lineage
- Avoid feature engineering duplication

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Feast** | Open-source, flexible, Kubernetes-native | Requires infrastructure | ✅ **Selected** |
| **Tecton** | Enterprise features, managed | Expensive, vendor lock-in | ❌ Rejected |
| **AWS SageMaker Feature Store** | Managed, integrated with AWS | Vendor lock-in, limited flexibility | ⚠️ Consider for AWS-only |
| **Custom Solution** | Full control | Time-consuming, reinventing the wheel | ❌ Rejected |

**Rationale**:
- **Centralized Features**: Single source of truth for features
- **Online/Offline**: Serve features for training (offline) and inference (online)
- **Low Latency**: Redis-backed online store (< 10ms)
- **Feature Versioning**: Track feature changes over time
- **Reusability**: Avoid duplicating feature logic across services
- **Open Source**: No licensing costs, community support

**Consequences**:
- ✅ Consistent features between training and serving
- ✅ Fast online feature retrieval
- ⚠️ Additional infrastructure to manage
- ⚠️ Learning curve for team

**Feature Examples**:
- Technical indicators (RSI, MACD) as features
- Rolling statistics (20-day average volume)
- Sentiment scores from news
- Market regime features (volatility, trend)

**Architecture**:
```
Offline: S3 (Parquet files) → Spark/Pandas → Features
Online: Redis (key-value) → < 10ms retrieval → Model inference
```

---

### TDR-013: MLflow for Experiment Tracking

**Decision**: Use MLflow for experiment tracking and model registry

**Status**: ✅ Approved

**Context**:
- Need to track ML experiments (hyperparameters, metrics, artifacts)
- Model versioning and registry
- Model deployment management
- Compare model performance

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **MLflow** | Open-source, language-agnostic, model registry | Self-hosted | ✅ **Selected** |
| **Weights & Biases** | Best UX, collaborative | SaaS, expensive at scale | ⚠️ Consider for small team |
| **Neptune.ai** | Good UX, metadata store | SaaS, expensive | ❌ Rejected |
| **Kubeflow** | Full ML platform | Complex, overkill | ⚠️ Consider for large-scale |
| **TensorBoard** | Simple, integrated with TF | Limited features, TensorFlow-focused | ❌ Rejected |

**Rationale**:
- **Open Source**: Free, self-hosted, no vendor lock-in
- **Language Agnostic**: Works with PyTorch, TensorFlow, scikit-learn
- **Model Registry**: Versioning, staging, production models
- **API**: Easy integration with training pipelines
- **Artifact Storage**: Store models, plots, datasets
- **Comparison**: Compare experiments side-by-side

**Consequences**:
- ✅ Comprehensive experiment tracking
- ✅ Model versioning and deployment
- ✅ No vendor lock-in
- ⚠️ Need to self-host and maintain
- ⚠️ UI is functional but not as polished as W&B

**Usage**:
```python
import mlflow

with mlflow.start_run():
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_metric("accuracy", 0.85)
    mlflow.pytorch.log_model(model, "model")
```

---

## Infrastructure

### TDR-014: Kubernetes for Container Orchestration

**Decision**: Use Kubernetes (EKS on AWS) for container orchestration

**Status**: ✅ Approved

**Context**:
- Need container orchestration for microservices
- Auto-scaling based on load
- Self-healing and high availability
- Multi-cloud portability

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Kubernetes (EKS)** | Industry standard, portable, feature-rich, managed | Complexity, learning curve | ✅ **Selected** |
| **AWS ECS** | Simple, AWS-native, cheaper | Vendor lock-in, less features | ❌ Rejected |
| **Docker Swarm** | Simple, built into Docker | Dying, limited features | ❌ Rejected |
| **Nomad** | Simple, flexible | Smaller ecosystem | ❌ Rejected |
| **Cloud Run (GCP)** | Serverless, simple | Vendor lock-in, limited control | ❌ Rejected |

**Rationale**:
- **Industry Standard**: Large community, extensive tooling, talent availability
- **Portability**: Can run on any cloud or on-prem
- **Auto-Scaling**: HPA (Horizontal Pod Autoscaler) and VPA (Vertical Pod Autoscaler)
- **Self-Healing**: Automatic restarts, health checks, rollouts
- **Service Discovery**: Built-in service discovery and load balancing
- **Declarative**: Infrastructure as code with YAML manifests
- **Ecosystem**: Istio, Prometheus, Grafana, ArgoCD, etc.

**Consequences**:
- ✅ Powerful orchestration and scaling
- ✅ Multi-cloud portability
- ✅ Large ecosystem and community
- ⚠️ Steep learning curve
- ⚠️ Operational complexity (mitigated with managed EKS)
- ⚠️ Cost (managed Kubernetes has overhead)

**Why EKS over GKE/AKS**:
- AWS has Mumbai region (data localization requirement)
- Largest cloud provider in India
- Team has AWS experience

**Configuration**:
- Managed node groups (3 AZs)
- Auto-scaling (cluster autoscaler)
- Network policy (Calico)
- Secrets management (External Secrets Operator + Vault)

---

### TDR-015: Terraform for Infrastructure as Code

**Decision**: Use Terraform for infrastructure provisioning

**Status**: ✅ Approved

**Context**:
- Need infrastructure as code
- Multi-cloud portability (AWS primary, but allow future expansion)
- Version control for infrastructure changes
- Reusable modules

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Terraform** | Multi-cloud, large ecosystem, HCL language | State management complexity | ✅ **Selected** |
| **AWS CloudFormation** | Native AWS, free, well-integrated | AWS-only, verbose YAML | ❌ Rejected |
| **Pulumi** | Real programming languages, modern | Smaller community, newer | ⚠️ Consider in future |
| **Ansible** | Agentless, flexible | Not purpose-built for infra | ❌ Rejected |

**Rationale**:
- **Multi-Cloud**: Not locked into AWS (can expand to GCP/Azure)
- **Declarative**: Define desired state, Terraform handles changes
- **Modules**: Reusable modules for VPC, EKS, RDS, etc.
- **State Management**: Track infrastructure state
- **Large Community**: Extensive provider support, modules
- **Plan Before Apply**: Preview changes before applying

**Consequences**:
- ✅ Infrastructure versioned in Git
- ✅ Reproducible environments (dev, staging, prod)
- ✅ Multi-cloud portability
- ⚠️ State file management (use S3 + DynamoDB for locking)
- ⚠️ Need Terraform expertise on team

**Structure**:
```
infrastructure/terraform/
  ├── modules/
  │   ├── vpc/
  │   ├── eks/
  │   ├── rds/
  │   ├── kafka/
  ├── environments/
  │   ├── dev/
  │   ├── staging/
  │   ├── production/
```

---

### TDR-016: ArgoCD for GitOps Deployments

**Decision**: Use ArgoCD for GitOps-based continuous deployment

**Status**: ✅ Approved

**Context**:
- Need automated deployments to Kubernetes
- Git as single source of truth
- Rollback capabilities
- Continuous synchronization

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **ArgoCD** | Kubernetes-native, GitOps, great UI | Kubernetes-only | ✅ **Selected** |
| **Flux CD** | Kubernetes-native, CNCF project | Less mature UI | ⚠️ Strong alternative |
| **Jenkins + kubectl** | Flexible, well-known | Not GitOps, complex pipelines | ❌ Rejected |
| **GitHub Actions + kubectl** | Simple, integrated with GitHub | Not declarative, no reconciliation | ❌ Rejected |
| **Spinnaker** | Multi-cloud, feature-rich | Complex, overkill | ❌ Rejected |

**Rationale**:
- **GitOps**: Git as single source of truth for deployments
- **Declarative**: Desired state in Git, ArgoCD syncs automatically
- **Kubernetes-Native**: Built specifically for Kubernetes
- **UI**: Excellent visualization of app state and sync status
- **Rollback**: Easy rollback to previous Git commit
- **Multi-Cluster**: Can manage multiple clusters from one ArgoCD instance
- **RBAC**: Fine-grained permissions for teams

**Consequences**:
- ✅ Automated, declarative deployments
- ✅ Git history as deployment audit trail
- ✅ Easy rollbacks
- ⚠️ Another tool to learn and maintain
- ⚠️ Requires Git discipline (no manual kubectl apply)

**Workflow**:
```
1. Developer commits Kubernetes manifest to Git
2. CI builds and pushes Docker image
3. CI updates manifest with new image tag
4. ArgoCD detects change in Git
5. ArgoCD applies changes to Kubernetes
6. ArgoCD monitors and syncs continuously
```

---

## Third-Party Services

### TDR-017: DigiLocker for KYC Document Verification

**Decision**: Use DigiLocker API for KYC document fetching

**Status**: ✅ Approved

**Context**:
- Need to verify user identity (KYC)
- SEBI compliance requirement
- Reduce friction in onboarding

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **DigiLocker** | Government-backed, authentic, widely adopted | Government API reliability | ✅ **Selected** |
| **Aadhaar eKYC (UIDAI)** | Instant verification, government-backed | Privacy concerns, UIDAI restrictions | ✅ **Use both** |
| **Manual Upload** | Simple, no API dependency | User friction, verification burden | ⚠️ Fallback option |
| **Third-party KYC (Karza, etc.)** | Feature-rich, reliable | Expensive, another vendor | ⚠️ Consider as backup |

**Rationale**:
- **Government-Backed**: Official documents from government issuers
- **User Convenience**: Users already have DigiLocker account (Aadhaar-linked)
- **Compliance**: Accepted by SEBI for KYC
- **Cost**: Free API (government service)
- **Documents**: PAN, Aadhaar, Driving License, etc.

**Consequences**:
- ✅ Authentic, government-issued documents
- ✅ Reduced user friction (no manual upload)
- ✅ Free API
- ⚠️ Dependency on government API (reliability concerns)
- ⚠️ Fallback to manual upload if DigiLocker unavailable

**Implementation**:
- OAuth 2.0 authorization flow
- Fetch documents on user consent
- Store encrypted in S3
- Fallback to manual upload if API fails

---

### TDR-018: Razorpay for Payment Processing

**Decision**: Use Razorpay as the primary payment gateway

**Status**: ✅ Approved

**Context**:
- Need payment processing for subscriptions
- PCI-DSS compliance required
- Support for UPI, cards, net banking
- Recurring payments

**Alternatives Considered**:

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Razorpay** | Feature-rich, PCI-DSS, good UX, popular in India | Fees | ✅ **Selected** |
| **PayU** | Similar features, competitive fees | Less intuitive API | ⚠️ Backup option |
| **Stripe** | Best-in-class API, global | India support limited, higher fees | ❌ Rejected |
| **Cashfree** | Competitive fees, good for B2B | Smaller ecosystem | ❌ Rejected |

**Rationale**:
- **PCI-DSS Level 1**: Compliant with payment card standards (we don't handle card data)
- **Payment Methods**: UPI, Cards, Net Banking, Wallets (Paytm, etc.)
- **Recurring Payments**: Subscription billing support
- **API Quality**: Well-documented, easy to integrate
- **Webhooks**: Real-time payment notifications
- **India Focus**: Built for Indian market
- **Trust**: Widely used by Indian startups

**Consequences**:
- ✅ PCI-DSS compliance (Razorpay handles card data)
- ✅ Wide range of payment methods
- ✅ Good developer experience
- ⚠️ Transaction fees (~2% + GST)
- ⚠️ Vendor dependency

**Implementation**:
- Razorpay Checkout for payment UI
- Webhook for payment confirmation
- Subscription API for recurring billing
- Payouts API for refunds (if needed)

---

## Summary Matrix

| Category | Decision | Reason |
|----------|----------|--------|
| **Frontend Framework** | Next.js 14 | SSR, performance, React ecosystem |
| **UI Library** | React 18 | Component reusability, ecosystem |
| **State Management** | Zustand + React Query | Lightweight, separation of concerns |
| **Charts** | TradingView Lightweight Charts | Performance, financial focus |
| **Backend (General)** | Node.js + Express | Non-blocking I/O, ecosystem |
| **Backend (AI/ML)** | Python + FastAPI | ML ecosystem, performance |
| **API Gateway** | Kong / AWS API Gateway | Enterprise features, managed |
| **Primary Database** | PostgreSQL 15 | ACID, JSON, full-featured |
| **Time-Series DB** | InfluxDB | Write throughput, compression |
| **Cache** | Redis | Performance, versatility |
| **Event Streaming** | Apache Kafka | Durability, throughput, ecosystem |
| **ML Framework** | PyTorch | Research-friendly, production-ready |
| **Feature Store** | Feast | Open-source, online/offline |
| **Experiment Tracking** | MLflow | Open-source, model registry |
| **Container Orchestration** | Kubernetes (EKS) | Standard, portable, feature-rich |
| **Infrastructure as Code** | Terraform | Multi-cloud, declarative |
| **CI/CD** | GitHub Actions + ArgoCD | GitOps, Kubernetes-native |
| **Monitoring** | Prometheus + Grafana | Standard, powerful, open-source |
| **Tracing** | Jaeger | OpenTelemetry, distributed tracing |
| **KYC** | DigiLocker + Aadhaar | Government-backed, authentic |
| **Payments** | Razorpay | PCI-DSS, India-focused |

---

**Document Version**: 1.0  
**Last Updated**: 2024-11  
**Next Review**: Quarterly  
**Related**: `PLATFORM_BLUEPRINT.md`
