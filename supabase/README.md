# Supabase schema notes

## `orchestration_sessions` search RPC

Use `GET /rest/v1/rpc/search_orchestration_sessions` with query params:

- `p_task_keyword` (text, optional)
- `p_start_date` (timestamptz, optional)
- `p_end_date` (timestamptz, optional)
- `p_page` (int, default `1`)
- `p_page_size` (int, default `25`, max `200`)
- `p_sort_by` (`created_at` | `task` | `session_id`, default `created_at`)
- `p_sort_order` (`asc` | `desc`, default `desc`)

Example:

```http
GET /rest/v1/rpc/search_orchestration_sessions?p_task_keyword=deploy&p_start_date=2026-01-01T00:00:00Z&p_end_date=2026-12-31T23:59:59Z&p_page=1&p_page_size=20&p_sort_by=created_at&p_sort_order=desc
```

## Safe write path

Direct client inserts are blocked by RLS. Trusted server-side code should call:

`insert_orchestration_session(p_session_id, p_task, p_agents, p_consensus, p_metrics, p_created_at)`

The function enforces `service_role` and validates required fields.
