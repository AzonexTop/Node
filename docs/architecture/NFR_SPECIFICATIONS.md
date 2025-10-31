# Non-Functional Requirements Specifications

This document details the non-functional requirements (NFRs) for the AI-driven Indian markets platform, including performance, scalability, reliability, security, and operational requirements.

---

## Table of Contents

1. [Performance Requirements](#performance-requirements)
2. [Scalability Requirements](#scalability-requirements)
3. [Availability Requirements](#availability-requirements)
4. [Reliability Requirements](#reliability-requirements)
5. [Security Requirements](#security-requirements)
6. [Auditability Requirements](#auditability-requirements)
7. [Maintainability Requirements](#maintainability-requirements)
8. [Usability Requirements](#usability-requirements)
9. [Compliance Requirements](#compliance-requirements)
10. [Testing Strategy](#testing-strategy)

---

## Performance Requirements

### API Response Times

| API Endpoint Category | p50 | p95 | p99 | p99.9 | Measurement |
|----------------------|-----|-----|-----|-------|-------------|
| **Authentication** | < 50ms | < 100ms | < 200ms | < 500ms | Server processing time |
| **User Profile Read** | < 30ms | < 100ms | < 200ms | < 400ms | Database query + serialization |
| **Market Data (Real-Time)** | < 20ms | < 50ms | < 100ms | < 200ms | Cache read + WebSocket push |
| **Market Data (Historical)** | < 100ms | < 300ms | < 500ms | < 1s | Time-series query |
| **Trading Signal Retrieval** | < 50ms | < 150ms | < 300ms | < 500ms | Database query + cache |
| **Portfolio Operations** | < 50ms | < 200ms | < 400ms | < 800ms | Multi-table joins + calculations |
| **Report Generation** | < 1s | < 3s | < 5s | < 10s | Data aggregation + rendering |
| **Search Operations** | < 100ms | < 300ms | < 500ms | < 1s | Elasticsearch query |

### Latency Requirements

| Data Flow | Target Latency (p95) | Critical |
|-----------|---------------------|----------|
| **Exchange → Platform** | < 50ms | ✓ |
| **Platform → Client (WebSocket)** | < 50ms | ✓ |
| **End-to-End Market Data** | < 100ms | ✓ |
| **Signal Generation** | < 5s | ✓ |
| **Alert Delivery** | < 30s | - |
| **Database Writes** | < 50ms | ✓ |
| **Cache Operations** | < 5ms | ✓ |

### Throughput Requirements

| Component | Target Throughput | Peak Throughput | Unit |
|-----------|------------------|----------------|------|
| **API Gateway** | 5,000 | 25,000 | requests/sec |
| **Market Data Events** | 100,000 | 500,000 | events/sec |
| **Database Reads** | 10,000 | 50,000 | queries/sec |
| **Database Writes** | 1,000 | 5,000 | writes/sec |
| **Kafka Messages** | 50,000 | 250,000 | messages/sec |
| **WebSocket Connections** | 10,000 | 50,000 | concurrent |
| **ML Inferences** | 100 | 1,000 | inferences/sec |

### Page Load Performance

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Real User Monitoring |
| **Total Blocking Time (TBT)** | < 300ms | Lighthouse |

### Database Performance

| Operation | Target | Volume |
|-----------|--------|--------|
| **Simple SELECT** | < 10ms | 100K/day |
| **JOIN Query (2-3 tables)** | < 50ms | 50K/day |
| **Complex Aggregation** | < 200ms | 10K/day |
| **INSERT** | < 20ms | 20K/day |
| **UPDATE** | < 30ms | 15K/day |
| **Time-Series Query (1 day)** | < 100ms | 50K/day |
| **Time-Series Query (1 month)** | < 500ms | 5K/day |

### Cache Performance

| Metric | Target |
|--------|--------|
| **Cache Hit Ratio** | > 90% |
| **GET Operation** | < 2ms (p99) |
| **SET Operation** | < 5ms (p99) |
| **Cache Invalidation** | < 10ms |

---

## Scalability Requirements

### Horizontal Scalability

| Component | Scaling Strategy | Min Instances | Max Instances | Trigger |
|-----------|-----------------|---------------|---------------|---------|
| **API Gateway** | Auto-scale | 3 | 20 | CPU > 70% or RPS > 1000/instance |
| **Auth Service** | Auto-scale | 3 | 10 | CPU > 70% or RPS > 500/instance |
| **Market Data Service** | Auto-scale | 5 | 30 | CPU > 60% or Memory > 80% |
| **Trading Signal Service** | Auto-scale | 2 | 10 | Queue depth > 100 or CPU > 70% |
| **Portfolio Service** | Auto-scale | 3 | 15 | CPU > 70% or RPS > 300/instance |
| **Web Frontend** | CDN + Auto-scale | 3 | 15 | RPS > 500/instance |
| **ML Inference (GPU)** | Queue-based | 1 | 5 | Queue wait time > 5s |

### Vertical Scalability

| Component | Initial Resources | Peak Resources | Scaling Limit |
|-----------|------------------|----------------|---------------|
| **PostgreSQL** | 4 vCPU, 16 GB RAM | 16 vCPU, 64 GB RAM | 32 vCPU, 128 GB RAM |
| **Redis** | 2 vCPU, 8 GB RAM | 8 vCPU, 32 GB RAM | 16 vCPU, 64 GB RAM |
| **Kafka** | 4 vCPU, 16 GB RAM per broker | 8 vCPU, 32 GB RAM | 16 vCPU, 64 GB RAM |
| **InfluxDB** | 4 vCPU, 16 GB RAM | 16 vCPU, 64 GB RAM | 32 vCPU, 128 GB RAM |

### Data Growth Projections

| Data Type | Current | Year 1 | Year 2 | Year 3 | Retention |
|-----------|---------|--------|--------|--------|-----------|
| **Market Data (Raw)** | 100 GB | 500 GB | 1.5 TB | 4 TB | 1 year |
| **Market Data (Aggregated)** | 50 GB | 200 GB | 500 GB | 1 TB | 5 years |
| **User Data** | 10 GB | 50 GB | 150 GB | 400 GB | Indefinite |
| **Trading Signals** | 5 GB | 25 GB | 75 GB | 200 GB | 2 years |
| **Audit Logs** | 20 GB | 100 GB | 300 GB | 900 GB | 7 years (SEBI) |
| **ML Model Artifacts** | 10 GB | 30 GB | 60 GB | 100 GB | Indefinite |
| **Total** | 195 GB | 905 GB | 2.5 TB | 6.6 TB | - |

### User Growth Projections

| Metric | Launch | 6 Months | 1 Year | 2 Years | 3 Years |
|--------|--------|----------|--------|---------|---------|
| **Total Users** | 1,000 | 10,000 | 50,000 | 200,000 | 500,000 |
| **Active Users (Monthly)** | 500 | 5,000 | 30,000 | 120,000 | 300,000 |
| **Peak Concurrent Users** | 100 | 1,000 | 5,000 | 20,000 | 50,000 |
| **Portfolios** | 500 | 5,000 | 30,000 | 150,000 | 400,000 |
| **Watchlists** | 1,000 | 10,000 | 60,000 | 300,000 | 800,000 |

---

## Availability Requirements

### Service-Level Agreements (SLA)

| Service Tier | Availability | Downtime/Year | Downtime/Month | Services |
|--------------|-------------|---------------|----------------|----------|
| **Tier 1 (Critical)** | 99.99% | 52.56 minutes | 4.38 minutes | Market Data, Auth, Trading Signals, API Gateway |
| **Tier 2 (High)** | 99.95% | 4.38 hours | 21.9 minutes | Portfolio, Alerts, User Management |
| **Tier 3 (Standard)** | 99.9% | 8.76 hours | 43.8 minutes | Analytics, Reporting, Backtesting |
| **Tier 4 (Best Effort)** | 99.0% | 3.65 days | 7.3 hours | Admin tools, Developer APIs |

### Uptime Monitoring

| Metric | Measurement | Alert Threshold |
|--------|-------------|-----------------|
| **Service Availability** | Health check every 30s | 2 consecutive failures |
| **API Success Rate** | (Success / Total) * 100 | < 99.5% over 5 minutes |
| **Dependency Availability** | External service health | Any failure |
| **Database Availability** | Connection test every 10s | Connection failure |
| **Message Queue Lag** | Consumer lag monitoring | Lag > 1000 messages |

### Maintenance Windows

- **Scheduled Maintenance**: Sundays 02:00 - 04:00 IST (non-trading hours)
- **Emergency Maintenance**: Anytime with 1-hour notice (if possible)
- **Zero-downtime Deployments**: Required for Tier 1 services during trading hours

### Disaster Recovery

| Metric | Target |
|--------|--------|
| **Recovery Time Objective (RTO)** | < 15 minutes |
| **Recovery Point Objective (RPO)** | < 5 minutes |
| **Backup Frequency** | Continuous (WAL) + Daily snapshots |
| **Backup Retention** | 30 days (rolling) + 7 years (compliance) |
| **Cross-Region Replication** | Async replication to secondary region |
| **DR Testing Frequency** | Quarterly |

---

## Reliability Requirements

### Error Budgets

| Service | Monthly Error Budget | Max Failed Requests |
|---------|---------------------|-------------------|
| **API Gateway** | 0.01% | 43,200 per month (at 100 req/s) |
| **Market Data** | 0.01% | 25,920 per month (at 60 req/s) |
| **Trading Signals** | 0.05% | Higher tolerance for ML models |
| **Portfolio** | 0.05% | 10,800 per month (at 25 req/s) |

### Fault Tolerance

| Failure Type | Detection Time | Recovery Time | Data Loss |
|--------------|---------------|---------------|-----------|
| **Service Instance Failure** | < 30s | < 60s | None |
| **Database Primary Failure** | < 30s | < 60s | < 5 minutes |
| **Cache Failure** | < 10s | < 30s | None (rebuild) |
| **Message Broker Failure** | < 30s | < 2 minutes | None (replication) |
| **External API Failure** | < 10s | Graceful degradation | N/A |

### Circuit Breaker Configuration

| Dependency | Failure Threshold | Timeout | Reset Timeout | Fallback |
|------------|------------------|---------|---------------|----------|
| **External Market Data API** | 50% errors in 10s | 3s | 30s | Cached data |
| **Database** | 50% errors in 10s | 5s | 60s | Read replica |
| **ML Model Inference** | 60% errors in 30s | 10s | 60s | Technical analysis only |
| **Third-party APIs** | 40% errors in 10s | 5s | 30s | Skip optional features |

### Retry Policies

| Operation Type | Max Retries | Backoff Strategy | Total Max Time |
|----------------|-------------|------------------|----------------|
| **Idempotent GET** | 3 | Exponential (1s, 2s, 4s) | 7s |
| **Idempotent POST/PUT** | 3 | Exponential (1s, 2s, 4s) | 7s |
| **Non-idempotent POST** | 0 | N/A | N/A |
| **External API Calls** | 5 | Exponential (500ms, 1s, 2s, 4s, 8s) | 15.5s |
| **Message Processing** | Infinite | Exponential (1s, 2s, 4s... max 60s) | Until success |

### Data Consistency

| Data Type | Consistency Model | Justification |
|-----------|------------------|---------------|
| **User Account Data** | Strong Consistency | Critical for authentication |
| **Portfolio Holdings** | Strong Consistency | Financial accuracy required |
| **Market Data (Real-Time)** | Eventual Consistency | Speed > consistency |
| **Trading Signals** | Eventual Consistency | Acceptable seconds delay |
| **Analytics Data** | Eventual Consistency | Non-critical |
| **Audit Logs** | Strong Consistency | Regulatory requirement |

---

## Security Requirements

### Authentication

| Requirement | Specification |
|-------------|---------------|
| **Password Policy** | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special |
| **Password Hashing** | bcrypt with cost factor 12 |
| **MFA** | TOTP (Time-based OTP) - mandatory for trading actions |
| **Session Duration** | 15 minutes (access token), 30 days (refresh token) |
| **Concurrent Sessions** | Max 3 devices per user |
| **Session Invalidation** | On password change, logout from all devices |
| **Failed Login Attempts** | Lock account after 5 failed attempts (15-min cooldown) |

### Authorization

| Requirement | Specification |
|-------------|---------------|
| **Access Control Model** | RBAC (Role-Based Access Control) |
| **Default Permission** | Deny by default, explicit allow |
| **Permission Granularity** | Resource-level (e.g., own portfolio only) |
| **Role Hierarchy** | Admin > Analyst > Premium User > Free User |
| **Permission Caching** | Cache for 5 minutes with invalidation |

### Data Protection

| Layer | Encryption | Key Management |
|-------|-----------|----------------|
| **Data in Transit** | TLS 1.3 (min) | Automated cert rotation (Let's Encrypt) |
| **Data at Rest (DB)** | AES-256 | AWS KMS / Vault |
| **Data at Rest (Files)** | AES-256 | AWS KMS |
| **PII Data** | Tokenization | Vault-managed tokens |
| **Passwords** | bcrypt hash | N/A |
| **API Keys** | AES-256 encrypted | Vault with 90-day rotation |
| **Backup Encryption** | AES-256 | Separate backup key |

### Network Security

| Control | Implementation |
|---------|----------------|
| **VPC** | Private subnets for app/data, public for LB only |
| **Security Groups** | Least privilege, port-specific rules |
| **WAF** | AWS WAF / CloudFlare - OWASP Top 10 rules |
| **DDoS Protection** | CloudFlare / AWS Shield Standard |
| **Rate Limiting** | 1000 req/hour per user, 100 req/hour for anonymous |
| **IP Whitelisting** | For admin endpoints |
| **API Key Rotation** | Every 90 days |

### Vulnerability Management

| Activity | Frequency | Tooling |
|----------|-----------|---------|
| **Dependency Scanning** | On every commit | Snyk / Dependabot |
| **Container Scanning** | On every build | Trivy / Clair |
| **SAST (Static Analysis)** | On every PR | SonarQube |
| **DAST (Dynamic Analysis)** | Weekly on staging | OWASP ZAP |
| **Penetration Testing** | Quarterly | External security firm |
| **Bug Bounty Program** | Continuous | Post-launch |
| **Security Patching** | Within 7 days for critical | Automated where possible |

### Incident Response

| Phase | Target Time | Responsibility |
|-------|-------------|----------------|
| **Detection** | < 5 minutes | Automated monitoring |
| **Notification** | < 10 minutes | PagerDuty → On-call engineer |
| **Initial Assessment** | < 30 minutes | Security team |
| **Containment** | < 1 hour | Engineering + Security |
| **Eradication** | < 24 hours | Engineering team |
| **Recovery** | < 24 hours | Engineering team |
| **Post-Incident Review** | Within 48 hours | All stakeholders |

---

## Auditability Requirements

### Audit Event Types

| Event Type | Retention | Storage | Searchable |
|------------|-----------|---------|------------|
| **Authentication Events** | 7 years | PostgreSQL + Elasticsearch | ✓ |
| **Authorization Failures** | 7 years | PostgreSQL + Elasticsearch | ✓ |
| **Data Modifications** | 7 years | PostgreSQL (append-only) | ✓ |
| **Financial Transactions** | 7 years | PostgreSQL (immutable) | ✓ |
| **API Access Logs** | 1 year | S3 + Elasticsearch | ✓ |
| **System Events** | 90 days | Elasticsearch | ✓ |
| **Security Events** | 7 years | PostgreSQL + SIEM | ✓ |

### Audit Log Schema

```json
{
  "event_id": "uuid",
  "timestamp": "ISO 8601 with timezone",
  "event_type": "enum (LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE, etc.)",
  "actor": {
    "user_id": "string",
    "role": "string",
    "ip_address": "string",
    "user_agent": "string",
    "session_id": "string"
  },
  "resource": {
    "type": "string (e.g., portfolio, user, signal)",
    "id": "string",
    "before": "json (for updates/deletes)",
    "after": "json (for creates/updates)"
  },
  "status": "enum (SUCCESS, FAILURE)",
  "error_code": "string (if failure)",
  "error_message": "string (if failure)",
  "metadata": "json (additional context)",
  "hash": "sha256 (for tamper detection)"
}
```

### Audit Log Protection

| Requirement | Implementation |
|-------------|----------------|
| **Tamper-Proof** | SHA-256 hash chain, each log includes hash of previous |
| **Immutability** | Append-only database table, no UPDATE/DELETE |
| **Integrity Verification** | Daily hash chain verification job |
| **Access Control** | Read-only access for auditors, write-only for system |
| **Encryption** | AES-256 at rest, TLS in transit |
| **Backup** | Daily backups to S3 Glacier (7-year retention) |

### Compliance Reporting

| Report Type | Frequency | Format | Recipient |
|-------------|-----------|--------|-----------|
| **Access Audit Report** | Monthly | PDF | Internal Audit Team |
| **Security Incident Report** | As needed | PDF | CERT-In (within 6 hours) |
| **SEBI Compliance Report** | Monthly | Excel | Compliance Officer |
| **Data Privacy Report** | Quarterly | PDF | DPO (Data Protection Officer) |
| **User Activity Report** | On request | CSV | User (self-service) |

---

## Maintainability Requirements

### Code Quality

| Metric | Target | Tool |
|--------|--------|------|
| **Code Coverage** | > 80% | Jest / pytest |
| **Code Duplication** | < 5% | SonarQube |
| **Cyclomatic Complexity** | < 15 per function | SonarQube / ESLint |
| **Technical Debt Ratio** | < 5% | SonarQube |
| **Documentation Coverage** | > 90% (public APIs) | JSDoc / Sphinx |

### Documentation Standards

| Document Type | Update Frequency | Format |
|---------------|-----------------|--------|
| **API Documentation** | On every API change | OpenAPI 3.0 (auto-generated) |
| **Architecture Docs** | Quarterly review | Markdown in repo |
| **Runbooks** | As needed | Markdown in repo |
| **Database Schema** | On every migration | Auto-generated from schema |
| **Deployment Guides** | On every infra change | Markdown in repo |
| **Incident Post-Mortems** | Within 48 hours | Markdown (private repo) |

### Monitoring & Observability

| Metric Type | Collection Frequency | Retention |
|-------------|---------------------|-----------|
| **Application Metrics** | 15 seconds | 30 days |
| **Infrastructure Metrics** | 1 minute | 90 days |
| **Business Metrics** | Real-time | 1 year |
| **Application Logs** | Real-time | 30 days (hot), 1 year (cold) |
| **Distributed Traces** | 100% critical paths, 10% others | 7 days |
| **Error Tracking** | Real-time | 90 days |

### Deployment Requirements

| Requirement | Specification |
|-------------|---------------|
| **Deployment Frequency** | Multiple times per day (CD) |
| **Deployment Time** | < 10 minutes per service |
| **Rollback Time** | < 5 minutes |
| **Blue-Green Deployment** | For critical services (zero downtime) |
| **Canary Deployment** | 5% → 25% → 100% over 2 hours |
| **Feature Flags** | For gradual rollouts and A/B testing |
| **Database Migrations** | Backward-compatible, rollback-safe |

---

## Usability Requirements

### Accessibility

| Standard | Compliance Level | Validation |
|----------|-----------------|------------|
| **WCAG 2.1** | Level AA | Automated (axe) + Manual testing |
| **Keyboard Navigation** | 100% functional | Manual testing |
| **Screen Reader Support** | Compatible with JAWS, NVDA | Manual testing |
| **Color Contrast** | Min 4.5:1 for text | Automated checking |
| **Font Size** | Min 16px, scalable to 200% | Responsive design |

### Internationalization

| Requirement | Support |
|-------------|---------|
| **Languages** | English (primary), Hindi (Phase 2) |
| **Locale** | India (INR currency, DD/MM/YYYY dates) |
| **Timezone** | IST (Indian Standard Time) |
| **Number Format** | Indian numbering (lakhs, crores) |
| **Right-to-Left** | Not required (Phase 1) |

### Performance Perception

| Metric | Target | Strategy |
|--------|--------|----------|
| **Perceived Load Time** | < 1 second | Skeleton screens, optimistic UI |
| **Loading Indicators** | Within 200ms | Spinner for > 500ms operations |
| **Offline Support** | Basic read-only | Service Worker caching |
| **Mobile Data Usage** | < 5 MB per session | Optimize images, lazy load |

### User Onboarding

| Metric | Target |
|--------|--------|
| **Registration Completion Rate** | > 70% |
| **Time to First Value** | < 5 minutes (first signal viewed) |
| **KYC Completion Rate** | > 80% within 7 days |
| **Tutorial Completion Rate** | > 60% |

---

## Compliance Requirements

### SEBI Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Registration** | Registered as Investment Adviser (if applicable) |
| **Disclosure** | Clear disclaimers on all signals/recommendations |
| **KYC** | DigiLocker + Aadhaar eKYC for all users |
| **Record Retention** | 5 years minimum (7 years for safety) |
| **Cyber Security Framework** | SEBI Circular on Cyber Security (SEBI/HO/ITD/CIR/2024) |
| **Incident Reporting** | CERT-In within 6 hours |
| **Audit Trail** | Immutable logs for all financial transactions |

### Data Protection (DPDP Act 2023)

| Requirement | Implementation |
|-------------|----------------|
| **Consent** | Explicit opt-in for data collection |
| **Data Minimization** | Collect only necessary data |
| **Purpose Limitation** | Data used only for stated purposes |
| **Right to Access** | Users can download their data (JSON/CSV) |
| **Right to Erasure** | Users can request deletion (with legal exceptions) |
| **Right to Correction** | Users can update their data |
| **Data Breach Notification** | Within 72 hours to users and DPAI |
| **Data Localization** | Critical personal data stored in India |

### RBI Compliance (Payment Processing)

| Requirement | Implementation |
|-------------|----------------|
| **PCI-DSS** | Use PCI-DSS Level 1 payment gateway (Razorpay) |
| **Two-Factor Auth** | For all payment transactions |
| **Data Localization** | Payment data stored in India |
| **Fraud Monitoring** | Real-time fraud detection and alerts |

### IT Act 2000

| Requirement | Implementation |
|-------------|----------------|
| **Data Security** | Reasonable security practices (ISO 27001 aligned) |
| **Sensitive Personal Data** | Encrypted storage and transmission |
| **Breach Notification** | Notify affected users |
| **Audit Logs** | Maintain for legal compliance |

---

## Testing Strategy

### Test Coverage Targets

| Test Type | Coverage Target | Frequency |
|-----------|----------------|-----------|
| **Unit Tests** | > 80% | On every commit |
| **Integration Tests** | > 70% | On every PR |
| **End-to-End Tests** | Critical paths | On every deployment |
| **Performance Tests** | Key endpoints | Weekly |
| **Load Tests** | System-wide | Before major releases |
| **Security Tests** | Full scope | Quarterly |
| **Accessibility Tests** | WCAG AA | Before releases |

### Performance Testing

| Test Type | Scenario | Success Criteria |
|-----------|----------|------------------|
| **Load Test** | Sustained 5,000 req/s for 1 hour | < 200ms p95, < 0.1% errors |
| **Stress Test** | Ramp to 25,000 req/s | Graceful degradation, no crashes |
| **Spike Test** | 0 → 10,000 req/s in 1 minute | Auto-scaling responds, < 500ms p95 |
| **Soak Test** | 2,000 req/s for 24 hours | No memory leaks, stable performance |
| **Capacity Test** | Find breaking point | Document max capacity |

### Chaos Engineering

| Experiment | Frequency | Expected Outcome |
|------------|-----------|------------------|
| **Random Pod Termination** | Weekly | Auto-recovery within 60s |
| **Network Latency Injection** | Monthly | Circuit breakers trigger, fallbacks work |
| **Database Failover** | Quarterly | RTO < 60s, no data loss |
| **Kafka Broker Failure** | Quarterly | Auto-rebalancing, message processing continues |
| **Region Failure** | Semi-annually | Failover to secondary region < RTO |

### Smoke Tests (Post-Deployment)

```yaml
tests:
  - name: "Health checks pass"
    endpoint: /health
    expected: 200
  
  - name: "User can login"
    endpoint: /auth/login
    expected: 200
  
  - name: "Market data flows"
    check: Kafka consumer lag < 100
  
  - name: "Signals generated"
    check: Signal count increased in last 5 minutes
  
  - name: "Database accessible"
    check: SELECT 1 from PostgreSQL
```

---

## Monitoring & Alerting

### Key Performance Indicators (KPIs)

| KPI | Target | Alert Threshold | Severity |
|-----|--------|----------------|----------|
| **API Availability** | > 99.99% | < 99.9% over 5 min | Critical |
| **API Response Time (p95)** | < 200ms | > 500ms over 5 min | High |
| **Error Rate** | < 0.1% | > 1% over 5 min | Critical |
| **Market Data Latency** | < 100ms | > 200ms over 2 min | Critical |
| **Database CPU** | < 70% | > 85% over 10 min | High |
| **Cache Hit Ratio** | > 90% | < 80% over 15 min | Medium |
| **Disk Usage** | < 80% | > 90% | High |
| **Pod Restart Rate** | < 1/hour | > 5/hour | High |

### Alert Routing

| Severity | Notification Channel | Response Time |
|----------|---------------------|---------------|
| **Critical** | PagerDuty (phone call) | Immediate |
| **High** | PagerDuty (push) + Slack | 15 minutes |
| **Medium** | Slack | 1 hour |
| **Low** | Email | Next business day |

---

## Conclusion

These NFRs form the foundation for building a reliable, performant, secure, and compliant AI-driven Indian markets platform. All requirements should be:

- ✅ Measurable with specific metrics
- ✅ Testable with automated tests where possible
- ✅ Monitored continuously in production
- ✅ Reviewed quarterly and updated as needed

**Next Steps**:
1. Implement monitoring for all NFR metrics
2. Create automated tests for critical NFRs
3. Establish baseline measurements
4. Set up alerting and on-call rotations
5. Conduct quarterly NFR reviews

---

**Document Version**: 1.0  
**Last Updated**: 2024-11  
**Related**: `PLATFORM_BLUEPRINT.md`, `DEPENDENCY_GRAPH.md`
