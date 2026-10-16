# Changelog

Dev-progress log for the Rexec , covering
`SciDx-rexec`, `SciDx-rexec-broker`, `SciDx-rexec-server`,
`rexec-server-k8s-deployment-api`, and `ndp-ep-py`. Newest entries first,
grouped by repo.

## 2026-10-14 — Rename `force` to `force_reinstall`

Breaking: the `force` option added on 2026-09-04 is renamed to
`force_reinstall` across all three layers, including the `/spawn` form
field. Behavior is unchanged. Clients and the deployment API must be
upgraded together; an old client's `force` is ignored by the new API (and
vice versa), so a replace request falls back to a 409 conflict.

**rexec-server-k8s-deployment-api** (0.1.0)
- `/spawn` now reads the `force_reinstall` form field instead of `force`.
  <br>
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/594f4aab8d5d988903ca41182b278157bf965f36

**SciDx-rexec** (0.1.0)
- `set_environment(..., force_reinstall=False)` replaces the `force`
  argument and sends `force_reinstall` to the deployment API.
  <br>
  https://github.com/sci-ndp/SciDx-rexec/commit/34e3173cd725d02f91ea4de23aafc19ec01031f8

**ndp-ep-py**
- `setup_rexec_environment(..., force_reinstall=False)` replaces the
  `force` argument; tests cover the default and the passthrough.
  <br>
  https://github.com/sci-ndp/ndp-ep-py/commit/f8f43ac24c8033c5e728bf7a3b783d2029ef65b5

## 2026-09-04 — Abuse-prevention hardening & respawn semantics

**rexec-server-k8s-deployment-api**
- Fixed a requirements-injection vulnerability: user-supplied package
  requirements were pasted unescaped into a root shell command at pod
  startup, letting a crafted requirement (a direct `@ url` reference, or
  shell metacharacters via a marker literal) run arbitrary code. Requirements
  are now validated more strictly (direct URL references rejected) and
  shipped to the pod as a mounted ConfigMap installed via `pip install -r`,
  never interpolated into a shell command.
  <br>
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/bf7e9e15d159afc15693c81b3001cb3f6a2eea58
- Every rexec-server pod now gets explicit CPU, memory, and
  ephemeral-storage requests/limits (previously unset entirely).
  <br>
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/bf7e9e15d159afc15693c81b3001cb3f6a2eea58#diff-7aa3f9349ed749ba2a2920ca19bad936785df6e9edda6e54e87b93c9b71a5024R68
- Fixed a bug where respawning a server with different requirements while
  the old one was still running silently reported success without changing
  anything. `/spawn` now has three explicit outcomes: create, no-op
  (same user and identical requirements), or a 409 conflict(same user and different requirements), to replace the running
  server now requires an explicit `force=true`, which interrupts any
  in-progress job.
  <br>
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/12b85151c09d75419fdf6206aaa83aa902533819
  - Added a Postman collection exercising all four `/spawn`
  outcomes end-to-end.
  
- Unified the response shape across success/conflict/error cases so client
  code doesn't need special-case parsing per outcome.
  <br>
  https://github.com/sci-ndp/rexec-server-k8s-deployment-api/commit/12b85151c09d75419fdf6206aaa83aa902533819


**SciDx-rexec**
- Fixed a bug where `set_environment()` silently dropped the auth token if
  it wasn't passed as an argument, even after calling `set_exec_token()`
  separately — now falls back to the previously-set token.
- Added the new `force` option, threaded through to the deployment API.

**ndp-ep-py**
- Added `force` to `setup_rexec_environment()`, passed through to
  `SciDx-rexec`.
