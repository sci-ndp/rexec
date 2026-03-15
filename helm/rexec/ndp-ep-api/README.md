# NDP Endpoint API Helm Chart

Helm chart version of `ep-api-kustomize` with the same Deployment, Service, Ingress, and HPA plus optional namespace support.

## Quick start

```bash
cd /Users/yutian1/dev/scidx-k8s/ep-api-helm

# Example: dev
helm install ndp-ep-api . \
  --namespace ndp-ep-dev \
  --create-namespace \
  -f values-dev.yaml
```

## Secrets

The app expects environment variables from a Secret named `ndp-ep-env-secret` by default.

Options:
- **Create from values**: keep `envSecret.create: true` and set `env` keys in your values file.
- **Use existing**: set `envSecret.create: false` and ensure `envSecret.name` exists in the namespace.
  - You can start from `env-secret.env.template`: copy it, fill values, and create a Secret manually, then set `envSecret.create: false`.
- **Create from a local .env file (kustomize-like)**:
  1. Copy `env-secret.env.template` to `env-secret.env` and fill your values (keep this file out of git).
  2. Use either:
     - chart-relative path in values: `envSecret.envFile: env-secret.env`, or
     - CLI file injection: `--set-file envSecret.envFile=env-secret.env`.
  3. Leave `envSecret.create: true` (default) so the chart renders the Secret from that file.

Example values snippet:
```yaml
env:
  ORGANIZATION: "My org"
  AUTH_API_URL: "https://idp.nationaldataplatform.org/temp/information"
```

## Root path + ingress

`rootPath.value` controls both the ingress path and a `ROOT_PATH` config map entry.
If you want an ingress path different from `rootPath.value`, set `ingress.path` explicitly.

## Environment values

These files mirror the kustomize overlays:
- `values-dev.yaml`
- `values-prod.yaml`

Install with `--namespace <env-namespace>` to match the overlay namespaces:
- dev: `ndp-ep-dev`
- prod: `ndp-ep`


## util
Run Helm lint to validate the chart:
```bash
helm lint /Users/yutian1/dev/scidx-k8s/ep-api-helm
```
Render the chart templates locally for dev environment:
```bash
helm template ndp-ep-api /ep-api-helm -f /ep-api-helm/values-dev.yaml --namespace ndp-ep-dev
```
