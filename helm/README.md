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
  # ==============================================
  # Authentication Configuration
  # ==============================================
  # URL for the authentication API to retrieve user information
  # This endpoint is used to validate tokens and fetch user details
  authApiUrl: https://idp-test.nationaldataplatform.org/temp/information
  # ==============================================
  # ACCESS CONTROL (Optional)
  # ==============================================
  # Group-based access control restricts write operations (POST, PUT, DELETE)
  # to users belonging to specific groups. GET endpoints remain public.
  #
  # How it works:
  # 1. User authenticates with Bearer token
  # 2. API validates token against AUTH_API_URL and retrieves user's groups
  # 3. If ENABLE_GROUP_BASED_ACCESS=True, checks if user belongs to any group in GROUP_NAMES
  # 4. Access granted only if user's groups overlap with GROUP_NAMES
  #
  # Group matching is case-insensitive (e.g., "Admins" matches "admins")
  # Enable group-based access control (true/false)
  enableGroupBasedAccess: true
  # Comma-separated list of allowed groups for write operations
  # Example: groupNames=admins,developers,data-managers
  # If empty and enableGroupBasedAccess=true, all write operations will be denied
  groupNames: /ndp_ep/ep-694b12d8b60dd2c1dd26f669

# SciDx Remote Execution Broker
# ---
rexec-broker:
  enabled: true
  service:
    external:
      clientNodePort: 30001
      controlNodePort: 30002
  replicaCount: 1


# SciDx Remote Execution Server Deployment API
# ---
rexec-server-deployment-api:
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
ndp-ep-api:
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