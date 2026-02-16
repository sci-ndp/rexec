# Rexec Streaming Execution Mode Spec (Draft v0.1)

## Scope

This repository does not contain the runtime implementation code for:

- `SciDx-rexec` (client)
- `SciDx-rexec-server` (worker/server)
- `SciDx-rexec-broker` (broker)
- `rexec-server-k8s-deployment-api` (spawn/deployment control plane)

It does contain deployment and operational artifacts. This spec defines a backward-compatible streaming mode that those runtime repos can implement.

## Problem

Current remote execution behavior is request/reply:

1. client sends function + args
2. worker runs `ret = fn(arg)`
3. worker sends one return payload and exits invocation

This model is a poor fit for long-running subscriptions (Kafka consumers, socket listeners, tailing jobs), where output is a sequence of events rather than one return value.

## Goals

- Keep existing single-return behavior unchanged by default.
- Add stream-capable invocation mode with explicit lifecycle.
- Support cancellation, heartbeat, and bounded resource use.
- Preserve delivery guarantees suitable for Kafka consumption.

## Non-goals

- Replacing Kafka consumer group semantics.
- Defining a full event processing framework.
- Forcing all users onto streaming mode.

## Execution Modes

All invocation requests MUST include `mode`:

- `request_reply` (default): existing behavior, exactly one terminal response.
- `stream`: invocation can emit zero to many data events before a terminal event.

## Envelope

All protocol messages should be wrapped in a common envelope:

```json
{
  "protocol_version": "1.0",
  "message_type": "START|DATA|HEARTBEAT|END|ERROR|CANCEL|ACK",
  "invocation_id": "uuid",
  "stream_id": "uuid-or-null",
  "timestamp": "RFC3339",
  "sequence": 0,
  "payload": {}
}
```

Rules:

- `invocation_id` identifies one function submission.
- `stream_id` is null for `request_reply`; non-null for `stream`.
- `sequence` increments per emitted stream message (`DATA`, `HEARTBEAT`, terminal messages).

## Stream Lifecycle

### 1) Invoke

Client sends invoke request:

```json
{
  "mode": "stream",
  "function_ref": "...",
  "args": {},
  "stream_options": {
    "max_duration_seconds": 3600,
    "max_idle_seconds": 120,
    "heartbeat_interval_seconds": 15,
    "buffer_max_messages": 1000,
    "auto_ack": false
  }
}
```

### 2) Start

Worker emits `START` with effective options and metadata.

### 3) Data

Worker emits `DATA` repeatedly.

### 4) Heartbeat

Worker emits `HEARTBEAT` when no data is emitted for `heartbeat_interval_seconds`.

### 5) Terminal

Stream ends with exactly one terminal message:

- `END` for graceful completion
- `ERROR` for failure
- `CANCEL` acknowledgement when client cancels

## Function Contract

Runtime should support either:

- iterator/async iterator (`yield` items)
- callback context (`ctx.emit(item)`)

Recommended worker behavior:

- If `mode=request_reply`, require a JSON-serializable return as today.
- If `mode=stream`:
  - accept iterators/generators/async generators
  - treat normal function return as a single `DATA` + `END`
  - disallow unbounded in-memory accumulation

## Cancellation

Client sends `CANCEL` for (`invocation_id`, `stream_id`).

Worker requirements:

- stop consuming upstream sources
- flush/close resources
- emit terminal `CANCEL` acknowledgement
- enforce hard-stop timeout if graceful shutdown exceeds configured limit

## Backpressure

Each stream must have a bounded output buffer.

Required controls:

- `buffer_max_messages`
- `buffer_overflow_policy`: `block` (default), `drop_oldest`, `drop_newest`, `error`

Default: `block` + bounded timeout; if timeout exceeded emit `ERROR`.

## Kafka-Specific Guidance

For Kafka-backed stream functions:

- Use consumer groups for partition ownership.
- Commit offset only after downstream acceptance policy:
  - `auto_ack=true`: commit after enqueue to stream buffer (at-least-once)
  - `auto_ack=false`: commit only after client `ACK(sequence)` (stronger replay safety)
- Include idempotency keys in emitted payload metadata for downstream dedupe.

## Delivery Semantics

Default target is **at-least-once** delivery for `stream` mode.

`DATA` message payload metadata should include:

- `source` (e.g., `kafka`)
- `partition`
- `offset`
- `key`
- `event_id` (stable hash or source id)

## Errors

`ERROR` payload should include:

- `code`
- `message`
- `retryable` boolean
- optional `details` map

## Timeouts and Limits

Recommended defaults:

- `max_duration_seconds`: 3600
- `max_idle_seconds`: 120
- `heartbeat_interval_seconds`: 15
- `graceful_shutdown_timeout_seconds`: 30

## Security and Isolation

- Keep auth/token checks same as existing invocation path.
- Ensure stream cancellation validates stream ownership.
- Enforce per-user stream caps to prevent noisy-neighbor issues.

## Metrics

Expose mode-aware metrics:

- `rexec_streams_active`
- `rexec_stream_messages_total`
- `rexec_stream_errors_total`
- `rexec_stream_duration_seconds`
- `rexec_stream_backpressure_events_total`
- `rexec_stream_cancellations_total`

## Rollout Plan

1. Implement protocol envelope + lifecycle in broker/server/client repos.
2. Gate by feature flag (`REXEC_STREAMING_ENABLED=false` default).
3. Add integration tests:
   - single-return compatibility
   - long-running stream with heartbeats
   - cancellation
   - reconnect and replay semantics
4. Gradually enable in selected environments.

## Compatibility

- No behavior change for users who do not set `mode=stream`.
- Existing notebooks/functions continue to work in `request_reply`.
