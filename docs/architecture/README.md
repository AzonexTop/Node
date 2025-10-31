# Platform Architecture Documentation

Welcome to the architecture documentation for the **AI-Driven Indian Markets Platform**. This directory contains comprehensive documentation covering the platform's design, technology decisions, and implementation roadmap.

---

## 📚 Documentation Index

### Core Documents

1. **[PLATFORM_BLUEPRINT.md](./PLATFORM_BLUEPRINT.md)** - Main architecture document
   - Executive summary and business context
   - High-level architecture overview
   - Detailed service decomposition (19 microservices)
   - Data flows and integration points
   - Technology stack with justifications
   - Deployment topology (Kubernetes, multi-region)
   - Security architecture and compliance
   - 18-month phased implementation roadmap

2. **[DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md)** - Service dependencies
   - Complete dependency graph with visual diagrams
   - Tiered dependency model (Tier 0-5)
   - Critical path analysis
   - Failure impact scenarios
   - Data flow diagrams
   - Kafka topic dependencies
   - Deployment order and startup sequence

3. **[NFR_SPECIFICATIONS.md](./NFR_SPECIFICATIONS.md)** - Non-functional requirements
   - Performance requirements (latency, throughput)
   - Scalability targets and growth projections
   - Availability SLAs (99.99% for critical services)
   - Reliability and fault tolerance
   - Security requirements (authentication, encryption)
   - Auditability (7-year retention per SEBI)
   - Testing strategy and monitoring

4. **[TECHNOLOGY_DECISIONS.md](./TECHNOLOGY_DECISIONS.md)** - Technology decision records
   - Frontend stack (Next.js, React, TradingView charts)
   - Backend stack (Node.js, Python, FastAPI)
   - Data storage (PostgreSQL, InfluxDB, Redis, Kafka)
   - AI/ML stack (PyTorch, Feast, MLflow)
   - Infrastructure (Kubernetes, Terraform, ArgoCD)
   - Third-party services (DigiLocker, Razorpay)

5. **[DATA_SCHEMA_DESIGN.md](./DATA_SCHEMA_DESIGN.md)** - Data schema specification
   - Relational ERD for PostgreSQL/TimescaleDB domains
   - Standardised lineage metadata across all stores
   - MongoDB, Elasticsearch, Redis, and warehouse models
   - Indexing, partitioning, and governance guidance

---

## 🎯 Quick Navigation by Role

### For Executives/Product Managers
Start with:
- [Executive Summary](./PLATFORM_BLUEPRINT.md#executive-summary)
- [Business Context](./PLATFORM_BLUEPRINT.md#business-context)
- [Phased Roadmap](./PLATFORM_BLUEPRINT.md#phased-implementation-roadmap)
- [Risk Assessment](./PLATFORM_BLUEPRINT.md#risk-assessment)

### For Engineering Leads/Architects
Focus on:
- [Architecture Overview](./PLATFORM_BLUEPRINT.md#architecture-overview)
- [Service Decomposition](./PLATFORM_BLUEPRINT.md#service-decomposition)
- [Technology Stack](./PLATFORM_BLUEPRINT.md#technology-stack)
- [Dependency Graph](./DEPENDENCY_GRAPH.md)
- [Technology Decisions](./TECHNOLOGY_DECISIONS.md)

### For DevOps/Infrastructure Engineers
Review:
- [Deployment Topology](./PLATFORM_BLUEPRINT.md#deployment-topology)
- [Infrastructure Decisions](./TECHNOLOGY_DECISIONS.md#infrastructure)
- [NFR Specifications](./NFR_SPECIFICATIONS.md)
- [Deployment Order](./DEPENDENCY_GRAPH.md#deployment-order)

### For Security/Compliance Officers
See:
- [Security Architecture](./PLATFORM_BLUEPRINT.md#security-architecture)
- [Compliance & Regulatory](./PLATFORM_BLUEPRINT.md#compliance--regulatory)
- [Security Requirements](./NFR_SPECIFICATIONS.md#security-requirements)
- [Auditability](./NFR_SPECIFICATIONS.md#auditability-requirements)

### For Data Scientists/ML Engineers
Explore:
- [AI/ML Services](./PLATFORM_BLUEPRINT.md#aiml-services)
- [Data Flows](./PLATFORM_BLUEPRINT.md#data-flows)
- [AI/ML Stack](./TECHNOLOGY_DECISIONS.md#aiml-stack)

### For Data Engineers
Review:
- [Data Schema Design](./DATA_SCHEMA_DESIGN.md)
- [Dependency Graph](./DEPENDENCY_GRAPH.md)
- [Technology Decisions](./TECHNOLOGY_DECISIONS.md)

### For Frontend Engineers
Check:
- [Frontend Services](./PLATFORM_BLUEPRINT.md#frontend-services)
- [Frontend Stack](./TECHNOLOGY_DECISIONS.md#frontend-stack)
- [Performance Requirements](./NFR_SPECIFICATIONS.md#performance-requirements)

---

## 🏗️ Architecture at a Glance

### System Overview

```
┌─────────────────────────────────────────────┐
│         Client Layer (Web + Mobile)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            API Gateway Layer                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Microservices Application Layer      │
│  - Authentication & User Management         │
│  - Market Data Ingestion & Serving          │
│  - AI/ML Trading Signals                    │
│  - Portfolio Management                     │
│  - Alerts & Notifications                   │
│  - Compliance & Audit                       │
│  - Analytics & Reporting                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              Data Layer                     │
│  - PostgreSQL (relational)                  │
│  - InfluxDB (time-series)                   │
│  - Redis (cache)                            │
│  - Kafka (event streaming)                  │
│  - S3 (object storage)                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      External Integrations                  │
│  - NSE/BSE/MCX APIs (market data)           │
│  - DigiLocker (KYC)                         │
│  - Razorpay (payments)                      │
│  - Twilio/SendGrid (notifications)          │
└─────────────────────────────────────────────┘
```

### Key Metrics

| Metric | Target | Phase |
|--------|--------|-------|
| **Users** | 500K | Year 3 |
| **Concurrent Users** | 50K | Year 3 |
| **API Throughput** | 25K req/sec | Peak |
| **Market Data Events** | 500K events/sec | Peak |
| **Latency (Market Data)** | < 100ms | p95 |
| **Latency (APIs)** | < 200ms | p95 |
| **Availability (Critical)** | 99.99% | SLA |
| **Data Storage** | 6.6 TB | Year 3 |

---

## 🚀 Implementation Phases

### Phase 0: Foundation (Months 1-2) ✅ Partially Complete
- ✅ Monorepo structure (Complete)
- ⏳ Infrastructure setup (Kubernetes, databases)
- ⏳ Core services (Auth, API Gateway)
- ⏳ CI/CD pipelines

### Phase 1: Market Data Foundation (Months 3-4)
- NSE/BSE API integration
- Real-time data ingestion pipeline
- Market data serving (WebSocket)
- Basic web application

### Phase 2: AI/ML Foundation (Months 5-7)
- Feature engineering pipeline
- First ML models (price prediction)
- Trading signal generation
- Backtesting framework

### Phase 3: Portfolio & Alerts (Months 8-9)
- Portfolio management
- P&L calculation and risk metrics
- Multi-channel alerts
- Mobile app (beta)

### Phase 4: Compliance & KYC (Months 10-11)
- DigiLocker + Aadhaar KYC
- Audit trail system
- SEBI compliance
- Security audit

### Phase 5: Advanced AI & Analytics (Months 12-14)
- Advanced ML models (ensemble, sentiment)
- Portfolio optimization
- Custom reports and analytics

### Phase 6: Scale & Optimize (Months 15-18)
- Multi-region deployment
- Performance optimization
- Cost optimization
- 50K concurrent users

---

## 🛡️ Compliance & Regulatory

### SEBI (Securities and Exchange Board of India)
- Investment Adviser registration (if providing advice)
- Clear disclaimers on AI signals
- KYC via DigiLocker + Aadhaar
- 7-year record retention
- CERT-In incident reporting (6 hours)

### RBI (Reserve Bank of India)
- PCI-DSS for payments (via Razorpay)
- Two-factor authentication
- Fraud monitoring

### DPDP Act 2023 (Data Protection)
- Explicit consent for data collection
- Data localization (India)
- Right to access, erasure, correction
- Breach notification (72 hours)

### IT Act 2000
- Reasonable security practices
- Encrypted sensitive data
- Audit logs

---

## 🔒 Security Highlights

### Authentication & Authorization
- JWT tokens (15-min expiry)
- MFA (TOTP) for trading actions
- RBAC (Role-Based Access Control)
- Session management (max 3 devices)

### Data Protection
- **In Transit**: TLS 1.3
- **At Rest**: AES-256 encryption
- **PII**: Tokenization
- **Passwords**: bcrypt (cost 12)

### Network Security
- VPC with private subnets
- WAF (OWASP Top 10 rules)
- DDoS protection (CloudFlare/AWS Shield)
- Rate limiting (1000 req/hour per user)

### Vulnerability Management
- Dependency scanning (Snyk/Dependabot) - daily
- Container scanning (Trivy) - on build
- SAST (SonarQube) - on PR
- Penetration testing - quarterly

---

## 📊 Key Technologies

### Frontend
- **Framework**: Next.js 14 (React 18)
- **State**: Zustand + React Query
- **Charts**: TradingView Lightweight Charts
- **Styling**: Tailwind CSS

### Backend
- **Node.js**: Express (general APIs)
- **Python**: FastAPI (AI/ML, data pipelines)
- **API Gateway**: Kong / AWS API Gateway

### Data Storage
- **Relational**: PostgreSQL 15
- **Time-Series**: InfluxDB
- **Cache**: Redis
- **Event Streaming**: Apache Kafka
- **Object Storage**: AWS S3

### AI/ML
- **Framework**: PyTorch
- **Feature Store**: Feast
- **Experiment Tracking**: MLflow
- **Model Serving**: TorchServe

### Infrastructure
- **Orchestration**: Kubernetes (EKS)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions + ArgoCD
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger

---

## 📈 Critical Data Flows

### Real-Time Market Data (Target: < 100ms)
```
NSE/BSE → Ingestion → Kafka → Stream Processor → InfluxDB
                            ↓
                       Market Data Service → Redis → WebSocket → Client
```

### Trading Signal Generation (Target: < 5s)
```
Market Data → Feature Store → Trading Signal Service (ML) → Kafka → Alert Service → User
```

### User Authentication (Target: < 200ms)
```
Client → API Gateway → Auth Service → PostgreSQL → JWT → Client
```

---

## 🏢 Service Inventory

| # | Service | Language | Purpose | Port | Critical |
|---|---------|----------|---------|------|----------|
| 1 | API Gateway | Kong | Request routing, rate limiting | 8080 | ✓ |
| 2 | Auth Service | Node.js | Authentication & authorization | 3010 | ✓ |
| 3 | User Management | Node.js | User profiles, KYC | 3011 | - |
| 4 | Market Data Ingestion | Python | Exchange API connections | 3020 | ✓ |
| 5 | Market Data Service | Node.js | Quote serving, WebSocket | 3001 | ✓ |
| 6 | Trading Signal Service | Python | AI-powered signals | 3030 | ✓ |
| 7 | Portfolio Service | Node.js | Portfolio tracking, P&L | 3040 | - |
| 8 | Alert Service | Node.js | Notifications (email/SMS/push) | 3050 | - |
| 9 | Compliance Service | Node.js | Audit logs, SEBI compliance | 3060 | - |
| 10 | Analytics Service | Python | Reports, dashboards | 3070 | - |
| 11 | Backtesting Service | Python | Strategy simulation | 3080 | - |
| 12 | Model Training | Python | ML model training | 3090 | - |
| 13 | Feature Store | Python | Feature serving | 3091 | - |
| 14 | Stream Processor | Python | Real-time event processing | N/A | - |
| 15 | Data Pipeline | Python | ETL orchestration (Airflow) | 8081 | - |

---

## 📞 Getting Help

### Internal Resources
- Architecture Slack: `#architecture`
- Security Questions: `#security`
- DevOps Support: `#devops`
- ML/AI Discussion: `#ml-engineering`

### External Resources
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Terraform Registry](https://registry.terraform.io/)
- [SEBI Regulations](https://www.sebi.gov.in/legal/regulations.html)
- [PyTorch Docs](https://pytorch.org/docs/)

---

## 🔄 Document Maintenance

### Review Schedule
- **Quarterly**: Full architecture review
- **Monthly**: Update for significant changes
- **On-demand**: For major decisions or incidents

### Change Process
1. Propose architecture change in RFC (Request for Comments)
2. Review with architecture team
3. Update relevant documents
4. Communicate to stakeholders
5. Track in architecture decision log

### Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-11 | Architecture Team | Initial comprehensive blueprint |

---

## ✅ Document Status

| Document | Status | Last Review | Next Review |
|----------|--------|-------------|-------------|
| PLATFORM_BLUEPRINT.md | 🟡 Draft | 2024-11 | Phase 0 completion |
| DEPENDENCY_GRAPH.md | 🟡 Draft | 2024-11 | Phase 0 completion |
| NFR_SPECIFICATIONS.md | 🟡 Draft | 2024-11 | Phase 0 completion |
| TECHNOLOGY_DECISIONS.md | 🟡 Draft | 2024-11 | Quarterly |

**Legend**:
- 🟢 Approved & Current
- 🟡 Draft for Review
- 🔴 Outdated / Needs Update

---

## 🎯 Next Steps

### Immediate (Phase 0)
1. [ ] Review and approve architecture blueprint
2. [ ] Set up core infrastructure (EKS, RDS, Redis, Kafka)
3. [ ] Implement Auth Service and API Gateway
4. [ ] Configure CI/CD pipelines
5. [ ] Set up monitoring stack

### Short-term (Phase 1)
1. [ ] Integrate NSE/BSE APIs
2. [ ] Build market data ingestion pipeline
3. [ ] Deploy Market Data Service
4. [ ] Launch basic web application
5. [ ] Achieve < 100ms market data latency

### Long-term (Phases 2-6)
1. [ ] Deploy AI/ML models for trading signals
2. [ ] Launch mobile application
3. [ ] Achieve SEBI compliance
4. [ ] Scale to 50K concurrent users
5. [ ] Multi-region deployment

---

## 📝 Contributing to Architecture Docs

### Adding New Documents
1. Follow naming convention: `UPPERCASE_WITH_UNDERSCORES.md`
2. Add table of contents for documents > 500 lines
3. Include diagrams for complex concepts
4. Update this README with link to new document

### Updating Existing Documents
1. Maintain version history table
2. Mark outdated sections with ⚠️
3. Update "Last Review" date
4. Notify stakeholders of significant changes

### Diagrams
- Use ASCII diagrams for simple flows (portable, Git-friendly)
- Use Mermaid for complex diagrams (renders on GitHub)
- Store binary diagrams (draw.io, etc.) in `/docs/diagrams/`

---

## 📄 License

This architecture documentation is proprietary and confidential. Unauthorized distribution is prohibited.

---

**Maintained by**: Platform Architecture Team  
**Contact**: architecture@company.com  
**Last Updated**: November 2024
