# rexec helm chart

This chart deploys three components using subcharts:

- `broker`
- `deploymentApi`

## Set Values

Set values in the parent chart (`helm/rexec/values.yaml`).
```sh
vi ./helm/rexec/values.yaml
```

### Example

```yaml
# Global defaults shared by all components
# ---
global:
  authApiUrl: "https://idp-test.nationaldataplatform.org/temp/information"
  imagePullSecrets: []


# SciDx Remote Execution Broker
# ---
broker:
  enabled: true
  authApiUrl: ""
  image:
    repository: "yutianqin/scidx-rexec-broker"
    tag: "latest"
    pullPolicy: Always
  service:
    external:
      clientNodePort: 30001
      controlNodePort: 30002
  replicaCount: 1


# SciDx Remote Execution Server Deployment API
# ---
deploymentApi:
  enabled: true
  image:
    repository: "yutianqin/rexec-server-k8s-deployment-api"
    tag: "latest"
    pullPolicy: Always
  ingress:
    enabled: true
    className: "<ingress-class-name>"
    hosts:
      - host: "<your-host>"
        paths:
          - path: /<api-root-path>
  env:
    rexecServerNamespacePrefix: "rexec-server-"
    enableGroupBasedAccess: false
    groupNames: ""
    rootPath: "/<api-root-path>"

```


## Install

```sh
helm template rexec ./helm/rexec --debug
```

```sh
helm dependency update ./helm/rexec
helm upgrade --install rexec ./helm/rexec -n rexec --create-namespace
```

```sh
helm uninstall rexec -n rexec
```