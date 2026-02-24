# rexec helm chart

This chart deploys three components using subcharts:

- broker
- deployment api
- ndp-ep-api

## Set Values

Set values in the parent chart.
```sh
cp ./helm/rexec/values.yaml.template ./helm/rexec/values.yaml
```
```sh
vi ./helm/rexec/values.yaml
```

### Example

```yaml
# Global defaults shared by all components
# ---
global:
  authApiUrl: https://idp-test.nationaldataplatform.org/temp/information


# SciDx Remote Execution Broker
# ---
broker:
  enabled: true
  service:
    external:
      clientNodePort: 30001
      controlNodePort: 30002
  replicaCount: 1


# SciDx Remote Execution Server Deployment API
# ---
deploymentApi:
  enabled: true
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: example.com
        paths:
          - path: /rexec
  env:
    rexecServerNamespacePrefix: rexec-server-
    enableGroupBasedAccess: false
    groupNames: 
    rootPath: /rexec

# NDP Endpoint API
# ---
epApi:
  enabled: true
  resources:
    limits:
      memory: 512Mi
      cpu: 500m
    requests:
      memory: 256Mi
      cpu: 250m
  ingress:
    enabled: true
    className: nginx
    host: example.com
    path: /api
  rootPath:
    enabled: true
    value: /api
  env:
    ORGANIZATION: My organization
    EP_NAME: My EP
    ...
```


## Install

**1. Update dependencies:**
  ```sh
  helm dependency update ./helm/rexec
  ```

Optional: Before deploying, render manifests locally: `helm template rexec ./helm/rexec --debug`

2.**Install or upgrade the chart:**
```sh
helm upgrade --install rexec ./helm/rexec -n rexec --create-namespace
```

## Uninstall
```sh
helm uninstall rexec -n rexec
```