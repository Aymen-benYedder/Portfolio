# vps-observability-stack

> Self-hosted Prometheus + Grafana observability stack for a single VPS — the exact setup from
> the guide at [aymen.benyedder.top](https://aymen.benyedder.top/blog/prometheus-grafana-self-hosted-monitoring-stack-vps/).

A production-ready, Docker Compose based monitoring stack: Prometheus, Grafana, Node Exporter,
cAdvisor, Alertmanager, and Loki/Promtail for logs. Built for a 2–4 GB VPS running Docker.

## Why this exists

Most "observability in production" tutorials assume managed cloud (CloudWatch, Datadog, GCP
Monitoring). This repo is the self-hosted path: ~$10/mo VPS, open-source stack, no per-metric
pricing. It powers the exact architecture described in the full article.

## Stack

| Component | Role | Port (internal) |
|---|---|---|
| Prometheus | Metrics collection + alerting rules | 9090 |
| Grafana | Dashboards + alerting UI | 3000 |
| Node Exporter | Host metrics (CPU/RAM/disk/net) | 9100 |
| cAdvisor | Container metrics | 8080 |
| Alertmanager | Alert routing to Telegram/email | 9093 |
| Loki + Promtail | Log aggregation | 3100 |

## Quick start

```bash
cp .env.example .env   # set your secrets + Telegram bot token
docker compose up -d
```

Open `http://<vps-ip>:3000` (default Grafana admin from `.env`). Prometheus scrapes are defined
in `prometheus/prometheus.yml`; alert rules live in `prometheus/alerts/*.yml`.

## Security checklist

- Grafana behind NGINX reverse proxy with SSL (Certbot) — never expose port 3000 directly.
- Basic auth or Cloudflare Access in front of Grafana and Prometheus.
- Keep Alertmanager webhook endpoints internal; only outbound to Telegram/email.

## Related articles

- [Prometheus + Grafana on a VPS](https://aymen.benyedder.top/blog/prometheus-grafana-self-hosted-monitoring-stack-vps/)
- [DevOps on a VPS for Startups](https://aymen.benyedder.top/blog/devops-vps-startups/)
- [Docker Security Hardening](https://aymen.benyedder.top/blog/docker-security-hardening-2026/)
