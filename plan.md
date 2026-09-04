# rexec TODO

<br>

## 1. Abuse Prevention
Enforcement layer: K8s limits vs. app-level throttling
-  Internal DDoS protection (broker/scheduler flooding)
-  Resource quotas: compute (CPU/GPU) and storage

monitor:
egress traffic, pod cpu usage..

 a. Fix the requirements-injection path. create_rexec_server.py + manifests/rexec-server-deployment.yaml. User-supplied requirement strings get string-substituted unescaped into a sh -c "pip install ...; git clone ..." run as root with full egress. Switch to writing requirements to a mounted file (pip install -r) and validate each entry against a strict allowlist (reject @, ;, env markers) before it's ever built into a command. Highest severity, smallest blast radius to fix, and it's the file you're already in.
    <br>
    https://github.com/sci-ndp/rexec/blob/381e0026fa9a6a892b6d10473343ec4fb37dec9e/CHANGELOG.md?plain=1#L10
 
 --
 
 b. Add resources.requests/limits + ephemeral-storage limits to the same manifest (rexec-server-deployment.yaml) — currently zero resource stanza exists anywhere. Pick 2-3 fixed size tiers; never trust a client-supplied size. This is the literal "resource quotas" ask and touches the exact code you have open.
    <br>
    https://github.com/sci-ndp/rexec/blob/381e0026fa9a6a892b6d10473343ec4fb37dec9e/CHANGELOG.md?plain=1#L19

--

 c. Fix the swallowed 409 on respawn — [rexec-server-k8s-deployment-api] kube/resources.py, called from create_rexec_server.py.

The Deployment name is hardcoded ("rexec-server") and never varies with the request; only a `digest` label (hash of the pinned Python version + sorted requirements) changes per request. That leads to three scenarios:

-  No server exists yet for this user → digest lookup finds nothing → a new Deployment is created normally.
-  A server exists and the caller resends the *same* requirements.txt → digest matches → correctly short-circuited as a no-op.
-  A server exists and the caller sends *different* requirements.txt → digest lookup finds no match, so the code tries to create a new Deployment with the same fixed name. Kubernetes rejects it with 409 Conflict (deploymet name already taken within the same namespace), and apply_manifest's generic exception handler catches *any* 409 and swallows it as "already exists, nothing to do" — so the function returns the exact same success message as a real create ("Remote Execution server created for user: {user_id}").

In that third case the caller is told their new environment is live, but nothing was actually touched: the old server keeps running with the old requirements — effectively orphaned relative to what the user now believes is running — while a brand-new digest-suffixed ConfigMap containing the requested requirements *is* created (unique name, so it doesn't conflict) but is never referenced by anything — an orphaned resource in its own right.

Net effect: a later remote call that depends on the new requirements (e.g. imports a package only in the new requirements.txt) fails on the *old*, unchanged environment with an unrelated-looking error, with nothing anywhere connecting that failure back to the silently-ignored /spawn call.
<br>
https://github.com/sci-ndp/rexec/blob/381e0026fa9a6a892b6d10473343ec4fb37dec9e/CHANGELOG.md?plain=1#L22

--

 d. Auth the broker's control port — [SciDx-rexec-broker] broker.py:106-112. Unauthenticated TERMINATE frame on an externally-reachable NodePort kills the sole broker replica — cheapest possible DoS in the system. Add a shared-secret check, move the port off the external Service. Different repo, but this is the single most urgent item overall — don't let file-proximity bump it down your real queue.

 e. Cache/offload the broker's per-message auth call — [SciDx-rexec-broker] broker.py/auth.py. Every message triggers a synchronous, uncached, 10s-timeout HTTP call inside the single-threaded proxy loop — this is the flooding mechanism the plan.md worries about, not a CPU/memory issue. Add a short-TTL token cache first (smallest change, biggest win).

 f. Verify + dashboard pod CPU in the existing Grafana — no code change. Confirm container_cpu_usage_seconds_total{namespace=~"rexec-server-.*"} is populated (it almost certainly is, via kube-prometheus-stack's default kubelet scrape), then add a panel + one alert rule. Cheapest possible win on the monitoring side since the infra already exists.

## 2. Reliability & Crash Handling
-  Crash feedback mechanism (status endpoint / callback / error code)
-  Systematic crash testing: broker crash, pod crash, network partition

client.rexec_server_status() → check for server health and crash status

## 3. Security & Isolation
-  Define security model (trust boundaries, threat actors, scope)
-  Define isolation model (namespace, network, filesystem per pod)
    -  Document explicit isolation guarantees (promised vs. best-effort)
-  ? Access token legitimacy check

show the mechanism for isolation and security, e.g., using K8s namespaces, network policies, and RBAC to ensure that each rexec job runs in a secure and isolated environment.

ref: <br>
https://www.eccouncil.org/cybersecurity-exchange/security-operation-center/mitre-attack-framework-guide/
https://nrp.ai/documentation/admindocs/cluster/security-tools/
https://nrp.ai/documentation/admindocs/participating/network/

## 4. Performance Benchmarking
-  Cold start: pod spawn (Server Deploy API + K8s scheduling)
-  Broker transit: ZeroMQ ROUTER/DEALER overhead
-  Execution: pure remote Python runtime time
-  Run on HPC-coupled setup + staging for comparison
-  Decompose latency into the 3 phases above (core paper contribution)


limitation: requirement predefined

0. local run 
1. exist server, submit code
2. new server, spawn server and submit code
3. exist server, new requirement, need to respawn a server and submit code

100 runs, calculate avg

## done 5. Server Lifecycle & Shutdown 
DD: July 2, 2026
-  Auto-shutdown for idle/completed rexec-server
-  User-controlled shutdown (manual kill/cancel API)
-  Max-duration policy for long-running jobs (timeout, grace period, warning)
-  ? Full lifecycle state spec (pending → running → completed/failed/killed)

#### Scheduling & Triggers
-  Scheduled function execution (cron-like)
-  Event-triggered function execution
-  Clean, consistent semantics/lifecycle across scheduled/triggered/on-demand jobs




## 6. Execution Output & Demo
-  `@remote_func_demo` — detailed output capture
-  Example: collect remote output → pipe to local `.txt`




## 7. Staging integration
-  interacte with data in dataspace 


---

1. benchmarking <br>
    same compute, not faster(overhead)
2. reason why we are doing this: usecases/argument

