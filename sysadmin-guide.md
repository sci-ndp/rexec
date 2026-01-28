# SciDx Remote Execution - Sysadmin Guide

## Prerequisites

- Kubernetes cluster with `kubectl` access (create namespace, deployment, service).
- A reachable broker endpoint (NodePort).
- Docker + Docker Compose for running the deployment API (or an equivalent container runtime).

[Get the repos](#get-the-repos)
<br>

[Deployment](#deployment)
    - [Step 1: Deploy the Broker (k8s)](#step-1-deploy-the-broker-k8s)
    - [Step 2: Deploy the Rexec Deployment API (docker)](#step-2-deploy-the-rexec-deployment-api-docker)
    - [Step 3: NDP Endpoint API (docker)](#step-3-ndp-endpoint-api-docker)
<br>

## Get the repos

Two components must be available:

1.  SciDx Remote Execution Broker (ZeroMQ broker inside Kubernetes);
    ```shell
    git clone https://github.com/sci-ndp/SciDx-rexec-broker
    ```
2.  Rexec Deployment API (FastAPI that deploys per-user rexec servers).
    ```shell
    git clone https://github.com/sci-ndp/rexec-server-k8s-deployment-api
    ```
3.  NDP Endpoint API (FastAPI that provide dataset search and rexec client).
    ```shell
    git clone https://github.com/national-data-platform/ep-api.git
    ```


## Deployment
Before proceeding, ensure you have access to an authentication API that provides user information based on Bearer tokens. This is essential for all 3 components: broker, deployment API, and ndp-endpoint API to authenticate users. That said, you can use the test authentication API at `https://idp-test.nationaldataplatform.org/temp/information` for initial testing. please ensure to use the same AUTH_API_URL across all components.

### Step 1: Deploy the Broker (k8s)

1.  Set the AUTH_API_URL:
    ```shell
    cd SciDx-rexec-broker
    ```
    ```shell
    vi k8s/kustomization.yaml
    ```

    Example:

    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    namespace: rexec-broker
    resources:
      - rexec-broker-namespace.yaml
      - rexec-broker-deployment.yaml
      - rexec-broker-service.yaml

    # Modify the AUTH_API_URL environment variable; change <patches.patch.value> as needed
    # --------------------------------
    patches:
      - target:
          kind: Deployment
          name: rexec-broker
        patch: |-
          - op: replace
            path: /spec/template/spec/containers/0/env/0/value
            value: "https://idp-test.nationaldataplatform.org/temp/information" # CHANGE ME
    ```

2.  Apply Kustomize deployment:
    ```shell
    kubectl apply -k sci/rexec/SciDx-rexec-broker/k8s
    ```

3.  Confirm
    ```shell
    kubectl get svc -n rexec-broker
    ```

Expected:
- `rexec-broker-internal-ip` (ClusterIP): server port `5560` for in-cluster servers.
- `rexec-broker-external-ip` (NodePort): client port `30001` by default.
<br>

### Step 2: Deploy the Rexec Deployment API (docker)

1.  Set environment variables
    ```
    cd rexec-server-k8s-deployment-api
    ```
    ```
    cp example.env .env
    ```
    ```
    vi .env
    ```

    > IMPORTANT:
    > 
    > 1.`REXEC_KUBECONFIG_LOCAL_PATH`<br>
    > 2.`AUTH_API_URL`<br>
    > 3.`GROUP_NAMES` if `ENABLE_GROUP_BASED_ACCESS` is set to `True`
    > 
    > Others can be leave as default, change them if needed.

    Example:

    ```sh
    # ==============================================
    # Rexec Provisioning Configuration
    # ==============================================

    # Path to the kubeconfig on the host
    # Example: REXEC_KUBECONFIG_LOCAL_PATH=~/.kube/config
    REXEC_KUBECONFIG_LOCAL_PATH=~/.kube/config-202

    # Path to the kubeconfig inside the container (should match the bind mount)
    REXEC_KUBECONFIG_MOUNT_PATH=/home/appuser/.kube/config

    # Prefix applied to namespaces created for Rexec users
    REXEC_NAMESPACE_PREFIX=rexec-server-

    # Service discovery values for the Rexec broker running in the cluster
    REXEC_BROKER_SERVICE_NAME=rexec-broker-internal-ip
    REXEC_BROKER_NAMESPACE=rexec-broker
    REXEC_BROKER_PORT=5560



    # ==============================================
    # Authentication Configuration
    # ==============================================

    # URL for the authentication API to retrieve user information
    # This endpoint is used to validate tokens and fetch user details
    AUTH_API_URL=https://idp-test.nationaldataplatform.org/temp/information



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

    # Enable group-based access control (True/False)
    ENABLE_GROUP_BASED_ACCESS=True

    # Comma-separated list of allowed groups for write operations
    # Example: GROUP_NAMES=admins,developers,data-managers
    # If empty and ENABLE_GROUP_BASED_ACCESS=True, all write operations will be denied
    GROUP_NAMES=/ndp_ep/ep-694b12d8b60dd2c1dd26f669
    ```

2.  Run it with docker compose
    ```shell
    docker compose up --build -d
    ```

3.  Confirm it’s up

    Swagger UI: `http://<host>:8000/docs`

<br>

### Step 3: NDP Endpoint API (docker)
Please refer to: https://github.com/national-data-platform/ep-api/blob/main/README.md
















