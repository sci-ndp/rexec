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
  # URL for the authentication API to retrieve user information;
  # All (Rexec Broker, Rexec Deployment API and NDP Endpoint API) will use
  # this URL for authentication and user group memebership info retrieval.
  authApiUrl: https://idp-test.nationaldataplatform.org/temp/information

  # ==============================================
  # Access Control (Optional) for: Rexec Server Deployment API and NDP Endpoint API
  # ==============================================
  # Group-based access control restricts write operations (POST, PUT, DELETE)
  # to users belonging to specific groups.
  # How it works:
  # 1. User authenticates with Bearer token
  # 2. API validates token against authApiUrl and retrieves user's groups
  # 3. If enableGroupBasedAccess=true, checks if user belongs to any group in groupNames
  # 4. Access granted only if user's groups overlap with groupNames
  #
  # Group matching is case-insensitive (e.g., "Admins" matches "admins")
  # Enable group-based access control (true/false)
  enableGroupBasedAccess: true
  # Comma-separated list of allowed groups for write operations
  # Example: groupNames=admins,developers,data-managers
  # If empty and enableGroupBasedAccess=true, all write operations will be denied
  groupNames: /ndp_ep/ep-************************


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
    # ==============================================
    # ORGANIZATION
    # ==============================================
    ORGANIZATION: <Your Organization Name>
    EP_NAME: <Your Endpoint Name>
    
    ...

    # ==============================================
    # Rexec Deployment API Configuration
    # ==============================================
    # Enable or disable Remote Execution Deployment API connectivity (True/False)
    REXEC_CONNECTION: True
    # Remote Execution Deployment API URL
    # This should be the public addr of the rexec-server-deployment-api component deployed by this chart 
    REXEC_DEPLOYMENT_API_URL: <Base URL of Rexec Deployment API>
```


## Install

**1. Update dependencies:**
  ```sh
  helm dependency update ./helm/rexec
  ```

Optional: Before deploying, render manifests locally: `helm template rexec ./helm/rexec --debug` for debugging and verification.

2.**Install or upgrade the chart:**
```sh
helm upgrade --install rexec ./helm/rexec -n rexec --create-namespace
```

## Uninstall
```sh
helm uninstall rexec -n rexec
```