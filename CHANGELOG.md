# Changelog

Dev-progress log for the Rexec , covering
`SciDx-rexec`, `SciDx-rexec-broker`, `SciDx-rexec-server`,
`rexec-server-k8s-deployment-api`, and `ndp-ep-py`. Newest entries first,
grouped by repo.

## 2026-09-04 — Abuse-prevention hardening & respawn semantics

**rexec-server-k8s-deployment-api**
- Fixed a requirements-injection vulnerability: user-supplied package
  requirements were pasted unescaped into a root shell command at pod
  startup, letting a crafted requirement (a direct `@ url` reference, or
  shell metacharacters via a marker literal) run arbitrary code. Requirements
  are now validated more strictly (direct URL references rejected) and
  shipped to the pod as a mounted ConfigMap installed via `pip install -r`,
  never interpolated into a shell command.
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/bf7e9e15d159afc15693c81b3001cb3f6a2eea58
- Every rexec-server pod now gets explicit CPU, memory, and
  ephemeral-storage requests/limits (previously unset entirely).
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/bf7e9e15d159afc15693c81b3001cb3f6a2eea58#diff-7aa3f9349ed749ba2a2920ca19bad936785df6e9edda6e54e87b93c9b71a5024R68
- Fixed a bug where respawning a server with different requirements while
  the old one was still running silently reported success without changing
  anything. `/spawn` now has three explicit outcomes: create, no-op
  (same user and identical requirements), or a 409 conflict(same user and different requirements), to replace the running
  server now requires an explicit `force=true`, which interrupts any
  in-progress job.
  - Added a Postman collection (`postman/`) exercising all four `/spawn`
  outcomes end-to-end.
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/12b85151c09d75419fdf6206aaa83aa902533819
- Unified the response shape across success/conflict/error cases so client
  code doesn't need special-case parsing per outcome.
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/12b85151c09d75419fdf6206aaa83aa902533819


**SciDx-rexec**
- Fixed a bug where `set_environment()` silently dropped the auth token if
  it wasn't passed as an argument, even after calling `set_exec_token()`
  separately — now falls back to the previously-set token.
- Added the new `force` option, threaded through to the deployment API.

**ndp-ep-py**
- Added `force` to `setup_rexec_environment()`, passed through to
  `SciDx-rexec`.
