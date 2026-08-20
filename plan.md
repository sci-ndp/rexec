# rexec TODO

<br>

## 1. Abuse Prevention
Enforcement layer: K8s limits vs. app-level throttling
-  Internal DDoS protection (broker/scheduler flooding)
-  Resource quotas: compute (CPU/GPU) and storage

monitor:
egress traffic
pod cpu usage

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

