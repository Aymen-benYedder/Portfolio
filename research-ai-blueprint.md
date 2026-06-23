# Research Blueprint: Deploying and Scaling LLMs in Production — A DevOps Guide to Self-Hosted AI Inference

**Author context:** Aymen Ben Yedder — DevOps Engineer & Web Systems Architect (Tunisia-based)  
**Existing AI article:** "Building an AI-Powered Workflow Orchestration Stack: Open WebUI, n8n, Qdrant, and PostgreSQL"  
**Date:** June 2026  
**Target category:** AI  
**Tone:** Infrastructure-first, practical, data-driven, Tunisian/regional DevOps lens

---

## Executive Summary

Self-hosting LLMs in production has shifted from experimental to operationally viable in 2026. Open-weight models (Llama 4, DeepSeek V3.2/V4, Qwen 3.5, Mistral Large) now match or exceed GPT-4-class performance on most benchmarks, while inference engines like vLLM (industry standard), SGLang, and Ollama have matured into production-grade serving stacks. The decision to self-host vs. use APIs hinges on three factors: token volume (break-even at ~40–100M tokens/month), data sovereignty requirements (GDPR, HIPAA, Tunisian LOPD 2004-63), and latency control (sub-50ms TTFT achievable on local GPUs vs. 100–500ms API network overhead). For DevOps engineers, the operational surface includes GPU cluster architecture on Kubernetes/vLLM Production Stack, Prometheus/Grafana observability with TTFT/TPOT/cache-usage metrics, continuous batching with PagedAttention, and horizontal scaling via tensor/pipeline parallelism. Security threats—prompt injection, weight exfiltration, model jailbreaking—require API authentication (JWT), rate limiting, encrypted-at-rest weights, and network isolation (mTLS). The total cost of a production-grade 70B model inference stack runs $3K–$5K/month on cloud GPUs (2× A100) vs. $20K+ upfront for on-premise hardware, with engineering overhead adding 20–40 hours initial setup and 5–10 hrs/month maintenance.

---

## 1. Core Statistics & Sources

### Market & Adoption
- **52M** monthly downloads of Ollama in Q1 2026 (source: dev.to/pooyagolchian)
- **95K+** GitHub stars on Ollama as of June 2026; **30K+** on vLLM; **22K+** on LocalAI (source: GitHub)
- **72%** of companies plan to increase AI budgets in 2026 (source: Kong 2025 Enterprise AI Report)
- **44%** cite data privacy/security as top barrier to LLM adoption (source: same Kong report)
- **64%** of enterprises now use GitOps as primary delivery mechanism (source: static post data)
- Model API costs doubled to **$8.4B** in 2025 (source: blog.premai.io/self-hosted-llm-guide-2026)

### Performance Benchmarks
- **vLLM: 793 tokens/sec** vs **Ollama: 41 TPS** on identical hardware — a **19× throughput gap** at scale (source: dev.to/jaipalsingh, 2026 benchmarks)
- At **128 concurrent users**, vLLM maintains sub-100ms P99 latency; Ollama spikes to **673ms** (source: same)
- **PagedAttention** reduces memory fragmentation by **40%+** (source: vLLM docs)
- **PARD** speculative decoding achieves up to **4.87× acceleration**, reaching **381.7 tokens/sec** on Qwen2.5 7B (source: arXiv 2504.18583v3)
- **H100** delivers ~3,958 TFLOPS (FP8), ~30× faster LLM inference vs previous gen (source: NVIDIA/fluence)
- **B200** delivers ~15× faster inference vs H200 with FP4 Tensor Cores (source: NVIDIA)

### Infrastructure Metrics
- VRAM formula: **~2 GB per 1B parameters at FP16**; Q4 quantization cuts this to **~0.5 GB per 1B** (source: spheron.network)
- 7B model: ~14 GB (FP16), ~3.5 GB (INT4) for weights; KV cache adds **20–40% overhead** (source: inferbase.ai)
- 70B model: ~140 GB (FP16), ~35 GB (INT4); requires 2× A100/H100 for production serving (source: multiple)
- KV cache for 32K context × batch of 8 adds **40+ GB** on a 70B model (source: inferbase.ai)
- Disaggregated prefill/decode prevents p50 latency exceeding **200ms** under high concurrency (source: markaicode.com)
- Plan for **20% GPU memory headroom** for model updates (source: same)

### Cost Data
- Self-hosting break-even: **~$20K/month API spend** or **~40–100M tokens/month** (source: tokenmix.ai, aipricingmaster.com)
- Below **50M tokens/day**, APIs are almost always cheaper (source: birjob.com)
- H100 rental: **$1.49–$2.99/hr** on cloud GPUs; **$25K–$35K** purchase (source: jarvislabs.ai, aipricingmaster.com)
- Llama 4 Scout via Groq API: **$0.11/M tokens** (source: agentdeals.dev)
- DeepSeek V4: **$0.30/M input tokens** for 1M context (source: same)
- Monthly self-hosted 70B cost (2× A100): **$3K–$5K/month** vs equivalent API: **$8K–$15K/month** at 100M+ tokens (source: tokenmix.ai)
- Claude Opus 4.6 price dropped **67%** ($5/$25 per M tokens, down from $15/$75) (source: agentdeals.dev)

### Monitoring & Observability
- vLLM exposes **20+ Prometheus metrics** via `/metrics` endpoint with `vllm:` prefix (source: vllm docs)
- Core metrics: `vllm:num_requests_running`, `vllm:kv_cache_usage_perc`, `vllm:time_to_first_token_seconds`, `vllm:time_per_output_token_seconds`, `vllm:e2e_request_latency_seconds` (source: vllm v1 metrics design)
- TGI exposes queue + request histograms via `/metrics` (source: glukhov.org observability guide)
- LMCache metrics: hit rates, cache usage in bytes, retrieve latency histograms (source: lmcache.ai docs)
- **GPU memory bandwidth utilization >85%** triggers latency spikes (source: markaicode.com)

---

## 2. Infrastructure Requirements

### GPU VRAM Requirements by Model Size

| Model Size | FP16 VRAM | Q8 VRAM | Q4 VRAM | Recommended GPU |
|---|---|---|---|---|
| 3B | ~6 GB | ~3 GB | ~2 GB | GTX 1660 / M1 / RTX 3050 |
| 7–8B | ~16 GB | ~8 GB | ~5 GB | RTX 3060 12GB / RTX 4070 |
| 13–14B | ~28 GB | ~14 GB | ~8 GB | RTX 4060 Ti 16GB / L4 (24GB) |
| 27–30B | ~60 GB | ~30 GB | ~18 GB | RTX 3090/4090 (24GB) |
| 70B | ~140 GB | ~70 GB | ~40 GB | 2× RTX 3090 / 2× A100 / H100 |
| 180B (MoE) | ~360 GB | ~180 GB | ~90 GB | 4× A100 / 2× H200 |
| 400B+ (MoE) | ~800 GB | ~400 GB | ~200 GB | 8× H100 / DGX cluster |

### GPU Tiers for Production (2026)

- **Enterprise:** B200 (FP4 Tensor Cores), H200 (141GB HBM3e, 4.8 TB/s), H100 (80GB HBM3, 3,958 TFLOPS FP8), A100 (40/80GB)
- **Professional:** L40S (48GB), RTX 6000 Ada (48GB), A40 (48GB)
- **Consumer:** RTX 4090 (24GB, best value), RTX 5090 (1.8 TB/s bandwidth, native NVFP4)
- **Inference-optimized:** L4 (24GB, 72W, 300 GB/s), T4 (16GB)
- **AMD alternative:** MI300X (192GB HBM3, 5.3 TB/s, 1,307 TFLOPS FP16)
- **Apple Silicon:** M4/M5 Max (unified memory up to 128GB, MLX runtime)

### Non-GPU Requirements

- **System RAM:** 16 GB minimum, 32–64 GB recommended (for KV cache offloading, OS buffers)
- **CPU:** Modern 8+ core (AMD 7950X or Intel equivalent); CPU-based inference is 10–30× slower
- **Storage:** NVMe SSD with 100–500 GB free for model files (GGUF quants: ~25 GB for 70B Q4)
- **Network:** 40 Gbps minimum between GPU nodes for tensor parallelism; NVLink recommended for TP >2
- **Power:** RTX 4090 ~450W; H100 ~700W; rack-level cooling for multi-GPU setups

### Production GPU Cluster Architecture

- **Disaggregated prefill and decode pools** — prevents throughput collapse at high concurrency
- **Bin-packing node scheduling** — reduces GPU memory fragmentation by up to 40%
- **Request-level queue with priority inversion** — longer context windows queued separately
- **20% GPU memory headroom** — accommodates model updates without immediate hardware upgrades
- **Kubernetes + vLLM Production Stack** (Helm chart) for orchestrated multi-node deployment

---

## 3. Deployment Options

### Inference Engine Comparison (2026)

| Feature | vLLM | Ollama | TGI | SGLang | LocalAI |
|---|---|---|---|---|---|
| **Stars** | ~30K | ~95K | ~5K | ~8K | ~22K |
| **Stack** | Python + CUDA | Go | Rust/Python | Python + CUDA | Go |
| **License** | Apache-2.0 | MIT | HFOIL v1.0 | Apache-2.0 | MIT |
| **Throughput** | Highest (793 TPS) | Low (41 TPS) | High | High | Medium |
| **PagedAttention** | ✅ Native | ❌ | ❌ | ✅ | ❌ |
| **Continuous batching** | ✅ | ✅ (limited) | ✅ | ✅ | ✅ |
| **Tensor parallelism** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Speculative decoding** | ✅ (EAGLE, MTP, PARD, n-gram) | ❌ | ❌ | ✅ | ❌ |
| **Structured outputs** | ✅ (JSON, regex, grammar) | ✅ (grammar) | ✅ | ✅ | ✅ |
| **GPU utilization** | 85–92% | 40–60% | 75–85% | 80–90% | 50–70% |
| **Setup time** | ~2 hours | ~10 minutes | ~1 hour | ~1 hour | ~45 min |
| **Best for** | Production multi-user | Dev/single-user | HF ecosystem | GPU clusters | API drop-in |

### Key Deployment Notes

- **TGI is now in maintenance mode** as of December 2025 (Hugging Face). Not recommended for new deployments.
- **vLLM Production Stack** offers a complete Helm chart for Kubernetes with autoscaling (HPA), Prometheus metrics, prefix-aware routing, and LMCache integration.
- **Ollama** hit 52M monthly downloads in Q1 2026 but lacks PagedAttention, multi-node support, and performs poorly under concurrent load.
- **SGLang** provides a native `/generate` path and offline Engine for in-process batch work; strong alternative to vLLM on GPU clusters.

### Kubernetes Integration Options

- **Helm chart** (`vllm-project/production-stack`) — autoscaling, GPU scheduling, PDB, PVC, ConfigMaps
- **KServe** — serverless inference on K8s with vLLM
- **Kaito** — automated GPU node provisioning
- **KubeRay** — Ray-based distributed serving
- **NVIDIA Dynamo** — multi-node inferencing
- **llm-d** — routing sidecar for multi-instance deployments
- **InftyAI/llmaz** — LLM-as-a-service on K8s
- **Operator pattern** with ServiceMonitor for Prometheus scraping

---

## 4. Scaling Patterns

### Parallelism Strategies

| Strategy | What It Does | Best For | Interconnect Need |
|---|---|---|---|
| **Data Parallelism (DP)** | Replicate model across GPUs, split requests | Scaling throughput at moderate concurrency (~50% gain at c=120–180) | None |
| **Tensor Parallelism (TP)** | Split layer matrices across GPUs | Lowest latency; 3× TTFT improvement | NVLink / 40 Gbps+ |
| **Pipeline Parallelism (PP)** | Split model layers across GPUs | Serving models that don't fit on single GPU; 2.5–3× TTFT reduction at high concurrency | Moderate |
| **Expert Parallelism (EP)** | Split MoE experts across GPUs | Mixture-of-Experts models (Mixtral, DeepSeek) | High |
| **Context Parallelism (CP)** | Split long sequences across GPUs | Very long context windows (128K+ tokens) | High |

### Speculative Decoding Methods in vLLM

| Method | Speedup | Description |
|---|---|---|
| **EAGLE** | 2–3× | Draft model-based, target-independent |
| **MTP (Multi-Token Prediction)** | 2–4× | Internal drafter head (Nemotron 3 Ultra style) |
| **PARD** | 1.78–4.87× | Parallel draft model adaptation, low-cost |
| **N-Gram** | 1.2–1.5× | Simple, no extra model needed |
| **Suffix** | 1.1–1.3× | Pattern-based, modest speedup |
| **MLP** | 1.5–2× | Lightweight neural proposer |

### Disaggregated Inference Architecture

```
                          +-------------------+
                          |   Load Balancer   |
                          |  (envoy / nginx)  |
                          +---------+---------+
                                    |
                                    v
                          +---------+---------+
                          |   Request Queue   |
                          | (priority-aware)  |
                          +--+-------------+--+
                             |             |
                    +--------v---+   +----v--------+
                    | Prefill    |   | Decode      |
                    | Pool       |   | Pool        |
                    | (compute)  |   | (memory BW) |
                    +--------+---+   +----+--------+
                             |             |
                    +--------v-------------v----+
                    |   KV Cache / LMCache     |
                    +--------------------------+
```

### Autoscaling Strategy

- **Metric-based HPA** on `vllm:num_requests_waiting` and `vllm:kv_cache_usage_perc`
- **GPU memory-based scaling** — add nodes when VRAM > 85%
- **Queue depth trigger** — scale when waiting requests exceed 2× GPU count
- **Cold start handling** — pre-warm models on standby GPU pool; 15–60s load time
- **Avoid CPU/memory-based HPA** — traditional scaling rules fail with LLM cold starts

---

## 5. Cost Analysis

### Self-Hosted vs API: Break-Even Points

| Volume | Best Option | Monthly API Cost (70B-class) | Self-Hosted Cost |
|---|---|---|---|
| < 10M tokens/month | API (DeepSeek V4/Gemini Flash) | $30–$300 | $3K–$5K (overprovisioned) |
| 10–100M tokens/month | API or Hybrid | $170–$2,700 | $3K–$5K (marginal at top end) |
| 100M–1B tokens/month | Self-hosted | $8K–$15K | $3K–$5K (saves 40–60%) |
| > 1B tokens/month | Self-hosted mandatory | $80K+ | $10K–$20K (8× H100 cluster) |

### Cost Breakdown: Self-Hosted 70B Model

| Category | Monthly Cost |
|---|---|
| Cloud GPU rental (2× A100 80GB) | $3,000–$5,000 |
| Storage (NVMe + model files) | $100–$300 |
| Engineering time (initial setup: 20–40 hrs @ $75–150/hr) | $1,500–$6,000 (one-time) |
| Ongoing maintenance (5–10 hrs/month) | $375–$1,500 |
| Electricity/cooling (on-premise) | $200–$600 |
| Networking (bandwidth, egress) | $50–$200 |
| **Total monthly (operational)** | **$3,725–$7,600** |
| **Total first month (with setup)** | **$5,225–$13,600** |

### Cost Comparison: API Providers (June 2026)

| Provider | Model | Input/M tokens | Output/M tokens | Context |
|---|---|---|---|---|
| xAI (Grok) | Grok 4.1 Fast | $0.20 | $0.50 | 128K |
| Groq | Llama 4 Scout | $0.11 | $0.11 | — |
| DeepSeek | V4 Flash | $0.30 | $0.30 | 1M |
| OpenAI | GPT-4o | $2.50 | $10.00 | 128K |
| Anthropic | Claude Opus 4.6 | $5.00 | $25.00 | 200K |
| Google | Gemini 2.5 Pro | $1.25 | $10.00 | 1M |
| Mistral | Mistral Large | $2.00 | $6.00 | 128K |

### Hidden Costs Teams Miss

- **GPU utilization is not 100%** — actual average utilization is 20–40% (peaky workloads)
- **Initial deployment takes 12–16 weeks** not 8 weeks (200% timeline overrun typical)
- **Engineer retention premium** — GPU/inference specialists command 20–30% salary premium
- **Model update overhead** — new models require re-benchmarking, re-quantization, re-deployment
- **Cold start GPU time** — idle GPUs between batches still incur costs

---

## 6. Monitoring & Observability

### Core LLM Inference Metrics

| Metric | Description | Alert Threshold | PromQL Example |
|---|---|---|---|
| **TTFT (Time to First Token)** | Latency from request → first token | p95 > 500ms | `histogram_quantile(0.95, rate(vllm:time_to_first_token_seconds_bucket[5m]))` |
| **TPOT (Time Per Output Token)** | Inter-token latency during decode | p95 > 100ms | `histogram_quantile(0.95, rate(vllm:time_per_output_token_seconds_bucket[5m]))` |
| **E2E Latency** | Request → final token | p99 > 10s | `histogram_quantile(0.99, rate(vllm:e2e_request_latency_seconds_bucket[5m]))` |
| **Throughput (TPS)** | Tokens per second | Below baseline | `rate(vllm:prompt_tokens_total[1m]) + rate(vllm:generation_tokens_total[1m])` |
| **KV Cache Usage** | % of KV cache blocks used | > 85% | `vllm:kv_cache_usage_perc` |
| **Queue Depth** | Waiting requests | > 2× GPU count | `vllm:num_requests_waiting` |
| **GPU Memory Bandwidth** | True bottleneck metric | > 85% | `DCGM_FI_DEV_MEM_COPY_UTIL` |
| **Error Rate** | 4xx/5xx responses | > 5% of total | `rate(vllm:request_success_total{status!="200"}[5m])` |

### vLLM Exposed Metrics (v1 Engine)

- **Gauges:** `num_requests_running`, `num_requests_waiting`, `kv_cache_usage_perc`, `gpu_cache_usage_perc`, `cpu_cache_usage_perc`, `prefix_cache_hit_rate`
- **Counters:** `prompt_tokens_total`, `generation_tokens_total`, `request_success_total`, `num_preemptions_total`, `spec_decode_num_accepted_tokens_total`
- **Histograms:** `time_to_first_token_seconds`, `time_per_output_token_seconds`, `e2e_request_latency_seconds`, `request_queue_time_seconds`, `request_inference_time_seconds`, `request_prompt_tokens`, `request_generation_tokens`

### Prometheus + Grafana Stack

```yaml
# prometheus.yml snippet
scrape_configs:
  - job_name: "vllm"
    metrics_path: /metrics
    static_configs:
      - targets: ["vllm:8000"]
  - job_name: "tgi"
    metrics_path: /metrics
    static_configs:
      - targets: ["tgi:8080"]
```

- **Grafana dashboard ID 25263** — vLLM Metrics (Grafana Labs, updated May 2026)
- **ServiceMonitor** for Kubernetes Prometheus Operator
- **OpenTelemetry tracing** — `--otlp-traces-endpoint` for distributed tracing across services

### Observability Stack Recommendations

| Component | Tool |
|---|---|
| Metrics collection | Prometheus + vLLM `/metrics` endpoint |
| Visualization | Grafana (pre-built dashboard ID 25263) |
| Logging | Structured JSON logs → Loki / ELK |
| Tracing | OpenTelemetry (vLLM `--collect-detailed-traces`) |
| GPU monitoring | DCGM Exporter (NVIDIA) |
| Alerting | Alertmanager (rules for TTFT, queue depth, OOM) |
| Cost tracking | Custom dashboard comparing infra vs equivalent API cost |

---

## 7. Security Considerations

### Threat Model for Self-Hosted LLMs

| Threat | Risk Level | Mitigation |
|---|---|---|
| Prompt injection | Critical | Input sanitization, system prompt hardening, rate limiting |
| Model weight exfiltration | High | Encrypted-at-rest volumes, read-only mounts, restricted FS perms |
| Unauthorized inference access | High | JWT authentication, RBAC, mTLS, API key rotation |
| RAG data leakage | High | Namespace isolation, tenant-scoped vector DB queries |
| GPU resource exhaustion (DoS) | Medium | Token-aware rate limiting at API gateway, connection limits |
| Model jailbreaking | Medium | Guardrails, output filtering, content safety classifiers |
| Container breakout | Medium | Drop all capabilities, non-root user, seccomp profiles |
| Supply chain (model poisoning) | Medium | Checksum verification, signed model weights, registry scanning |

### API Security Baseline

```nginx
# Nginx rate limiting for inference endpoint
limit_req_zone $binary_remote_addr zone=llm_limit:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=llm_conn:10m;

server {
    location /v1/chat/completions {
        limit_req zone=llm_limit burst=5 nodelay;
        limit_conn llm_conn 5;
        proxy_pass http://vllm:8000;
    }
}
```

### 8 Security Must-Do Items

1. **Never expose inference ports directly** — always use reverse proxy (NGINX/Envoy) with TLS
2. **JWT authentication** with scoped claims and short expiration on all inference endpoints
3. **Role-based access control** — separate inference consumers, prompt engineers, model admins, auditors
4. **Model weights on encrypted volumes** — read-only mounts, restricted file system permissions
5. **mTLS between services** — segment inference, vector DB, and orchestrator networks
6. **Rate limiting at API gateway** — prevent GPU resource exhaustion (token-aware)
7. **Container hardening** — drop all capabilities, non-root user, seccomp, no privileged mode
8. **Audit logging** — capture request metadata (not prompt content) for compliance

### Compliance Mapping

- **EU AI Act:** Risk categorization, transparency requirements, human oversight
- **NIST AI RMF:** Govern, Map, Measure, Manage framework
- **SOC 2:** Access controls, encryption, monitoring commitments
- **Tunisian LOPD 2004-63:** Data localization, consent, processing registry
- **GDPR:** Data Processing Agreement (DPA), right to explanation, data portability
- **HIPAA:** Business Associate Agreement (BAA), audit controls, integrity controls

---

## 8. Integration Patterns with DevOps Tooling

### CI/CD Pipeline for Model Deployment

```
Git Push → GitHub Actions → Test (benchmark eval) → Build (containerize) → Push to Registry → GitOps Sync (ArgoCD/Flux) → Rollout (canary) → Monitor (Prometheus/Grafana)
```

### Kubernetes Workflow

```yaml
# vLLM Helm values.yaml
servingEngineSpec:
  modelSpec:
    - name: "llama-4-scout"
      repository: "vllm/vllm-openai"
      tag: "latest"
      modelURL: "meta-llama/Llama-4-Scout-17B"
      replicaCount: 2
      requestGPU: 2
      tensorParallelSize: 2
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 8
    metrics:
      - type: Pods
        pods:
          metric: vllm:num_requests_waiting
          target:
            type: AverageValue
            averageValue: 10
```

### DevOps Toolchain Integration

| DevOps Tool | Integration Point |
|---|---|
| **ArgoCD / FluxCD** | GitOps sync for model deployment manifests |
| **Prometheus + Grafana** | Metrics scraping, dashboards, alerting |
| **GitHub Actions / GitLab CI** | Build, test, push model containers |
| **Terraform / OpenTofu** | GPU node provisioning, VPC, firewall rules |
| **Helm** | Package vLLM/TGI/SGLang deployments |
| **Vault / External Secrets** | HF tokens, API keys, model registry credentials |
| **Flagger / Argo Rollouts** | Canary deployments for model updates |
| **ELK / Loki** | Inference request logging and audit trails |
| **OpenTelemetry** | Distributed tracing across inference chain |
| **PagerDuty / OpsGenie** | Alert routing for SLO breaches |

### Model Registry & Versioning Strategy

- **Store models in S3-compatible storage** (MinIO, R2) with versioned paths
- **Use `modelURL` + checksum** for immutable model references
- **Tag images with model name + quant + date** (e.g., `llama-4-scout-q4-20260601`)
- **Implement A/B testing** — route 10% traffic to new model version via Envoy weighted routing
- **Automated benchmark gate** — reject model deployment if eval score drops > 2%

---

## 9. Direct Answer (AEO/GEO Optimized — 2–4 Sentences)

**Question:** How do you deploy and scale LLMs in production with self-hosted AI inference?

**Answer:** Deploying LLMs in production requires selecting an inference engine (vLLM for high-throughput serving, Ollama for development, SGLang for GPU clusters), provisioning adequate GPU VRAM (roughly 2 GB per billion parameters at FP16, or 0.5 GB with INT4 quantization), and orchestrating with Kubernetes using the vLLM Production Stack Helm chart. Scaling is achieved through continuous batching with PagedAttention, tensor/pipeline parallelism across multiple GPUs, disaggregated prefill/decode pools to prevent throughput collapse, and speculative decoding (EAGLE, MTP, PARD) to reduce inter-token latency by 2–4×. For DevOps teams, the operational stack must include Prometheus/Grafana monitoring of TTFT, TPOT, KV cache usage, and queue depth; JWT-authenticated API gateways with token-aware rate limiting; and GitOps-driven CI/CD for model updates — all while maintaining the 20–30% GPU memory headroom required for production stability.

---

## 10. Key Takeaways

1. **vLLM is the production standard in 2026** — its PagedAttention delivers 19× higher throughput than Ollama at scale (793 vs 41 TPS) and sub-100ms P99 latency under 128 concurrent users. Use Ollama only for development/single-user scenarios.

2. **Self-hosting breaks even at $20K/month API spend or ~100M tokens/month** — below that, APIs (DeepSeek V4 at $0.30/M tokens, Groq Llama 4 Scout at $0.11/M) are cheaper. Above it, self-hosting saves 40–60%, but only after accounting for 20–40 hours of engineering setup and 20–40% actual GPU utilization.

3. **Disaggregated prefill/decode is the single most important architectural decision** — colocating both phases on the same GPU causes throughput collapse at high concurrency. Separating them into dedicated GPU pools with 40 Gbps+ interconnect prevents p50 latency from exceeding 200ms.

4. **Monitor KV cache pressure, not just GPU utilization** — the KV cache is the hidden memory consumer that grows with context length and batch size. A 70B model with 32K context × 8 concurrent requests adds 40+ GB of KV cache. Set alerts at 85% cache usage, not 90% GPU memory.

5. **Security is non-negotiable for self-hosted inference** — protect against prompt injection, weight exfiltration, and GPU resource exhaustion with JWT auth, mTLS segmentation, encrypted-at-rest weights, rate limiting at the API gateway, and container hardening (non-root, seccomp, dropped capabilities).

---

## 11. FAQ Items

**Q1: What's the cheapest way to get started self-hosting LLMs in production?**
Start with a single RTX 4090 (24 GB VRAM, ~$1,600) running quantized models via vLLM or Ollama. A 7B model at Q4 fits in ~5 GB and can serve internal tools at 40–80 TPS. For cloud, rent a single L4 or A100 on RunPod/Vast.ai ($0.50–$1.50/hr). Expect to handle 1–10 concurrent users on this setup before needing multi-GPU scaling.

**Q2: When should I use vLLM vs Ollama vs SGLang for my project?**
Use **Ollama** for local development, prototyping, and single-user tools (setup: 10 min). Use **vLLM** for production workloads serving 10+ concurrent users — it's the only engine with PagedAttention, continuous batching, and full speculative decoding support. Use **SGLang** as a vLLM alternative on GPU clusters where you need its native `/generate` path and YAML-based server configuration.

**Q3: Can I self-host LLMs on CPU-only hardware?**
Yes, but performance is 10–30× slower than GPU inference. A 7B model at Q4 on a modern 16-core CPU achieves ~2–5 TPS — usable for batch processing but not interactive applications. Tools like llama.cpp and Ollama support CPU inference with AVX2/NEON optimizations. For interactive use, even a consumer GPU (RTX 3060 12GB) is strongly recommended.

**Q4: How do I handle model updates without downtime in production?**
Use Kubernetes with the vLLM Production Stack Helm chart. Deploy a new model version as a separate deployment, warm it up (15–60s for model loading), then shift traffic via Envoy weighted routing. Implement canary releases with Flagger — route 10% traffic, monitor TTFT/error rate for 5 minutes, then gradual rollout. Always keep the previous model version as a rollback target.

**Q5: What are the most important metrics to alert on for LLM inference?**
Alert on: (1) **TTFT p95 > 500ms** — indicates prefill bottleneck or queue buildup; (2) **KV cache usage > 85%** — imminent OOM risk for new requests; (3) **GPU memory bandwidth > 85%** — true throughput bottleneck; (4) **Error rate > 5%** — model corruption or configuration issues; (5) **Queue depth > 2× GPU count** — need to scale horizontally. Start with these five; add GPU temperature and power draw for on-premise hardware.

---

## 12. Recommended Tags

`LLM Inference`, `Self-Hosted AI`, `vLLM`, `GPU Deployment`, `AI DevOps`, `Kubernetes`, `Model Serving`, `PagedAttention`, `Speculative Decoding`, `AI Observability`, `Prometheus`, `Grafana`, `Tensor Parallelism`, `Tunisia DevOps`, `AI Infrastructure`

---

## Appendix: Research Sources

| Source | URL |
|---|---|
| vLLM Production Stack Helm | https://docs.vllm.ai/projects/production-stack/ |
| vLLM Metrics Design | https://docs.vllm.ai/en/latest/design/metrics |
| LLM Inference Monitoring Guide | https://www.glukhov.org/observability/monitoring-llm-inference-prometheus-grafana/ |
| GPU Sizing Guide (Inferbase) | https://inferbase.ai/blog/gpu-sizing-guide-for-llm-inference |
| GPU Memory Requirements (Spheron) | https://www.spheron.network/blog/gpu-memory-requirements-llm/ |
| Self-Hosted Costs (SitePoint) | https://www.sitepoint.com/self-hosted-llm-costs-2026 |
| Self-Host vs API Break-Even (TokenMix) | https://tokenmix.ai/blog/self-host-llm-vs-api |
| Ollama vs vLLM vs TGI (BirJob) | https://www.birjob.com/blog/vllm-tgi-ollama-self-hosting-llms |
| GPU Cluster Architecture (Markaicode) | https://markaicode.com/architecture/production-gpu-cluster-architecture |
| Scaling LLM Inference (JarvisLabs) | https://jarvislabs.ai/blog/scaling-llm-inference-dp-pp-tp |
| PARD Speculative Decoding | https://arxiv.org/html/2504.18583v3 |
| Local LLM Security (SitePoint) | https://www.sitepoint.com/local-llm-security-best-practices-2026 |
| Ollama Security Best Practices | https://www.grandlinux.com/en/blogs/ollama-self-host-security.html |
| AEO/GEO Guide 2026 | https://www.contextstudios.ai/guides/aeo-geo-complete-guide-2026 |
| LLM API Pricing 2026 (AgentDeals) | https://agentdeals.dev/llm-api-pricing |
| Hardware Requirements (Overchat) | https://overchat.ai/ai-hub/llm-hardware-requirements |
| vLLM Speculative Decoding | https://docs.vllm.ai/en/latest/features/speculative_decoding/ |

---

**Status:** ✅ Research complete. Ready for `@supervisor-content-lead` review and handoff to `@drafter-agent`.
