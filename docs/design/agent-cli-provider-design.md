# Agent CLI Provider Design

## Goal

Make the backend analysis pipeline support Codex as a first-class agent CLI provider while preserving the current Claude CLI behavior.

The current configuration suggests support for multiple CLIs:

```yaml
llm:
  cli_tool: "claude" # "claude" | "codex"
```

However, the implementation assumes one command shape:

```bash
<cli> --model <model> -p <prompt>
<cli> mcp list
```

This is not a valid abstraction for all agent CLIs. Codex uses a different non-interactive command shape:

```bash
codex exec --model <model> <prompt>
codex mcp list
```

The fix should introduce provider-specific adapters so the rest of the backend does not need to know each CLI's command syntax.

## Current Weakness

The backend treats `cli_tool` as only an executable name, but an agent CLI provider is actually a contract:

- how to run a prompt
- how to pass a model
- how to pass long prompt input
- how to list MCP servers
- how to check installation/auth readiness
- how to classify failures
- how to parse returned output

Because those details are not isolated, Claude-specific assumptions are spread across:

- `be/app/infrastructure/collectors/llm_mcp.py`
- `be/app/infrastructure/analysis/pipeline/llm_runner.py`
- `be/app/config.py`
- `be/config/default.yaml`

## API Contract

No public API contract should change for this implementation.

Keep these endpoint behaviors unchanged:

- `POST /api/v1/analysis-runs`
- `GET /api/v1/analysis-runs/{run_id}`
- profile read APIs that depend on completed analysis runs

Optional new endpoint:

- `GET /api/v1/system/agent-cli-health`

This endpoint is useful but not required for the first implementation if startup logging is simpler.

## Proposed Architecture

Add a provider layer under infrastructure:

```text
be/app/infrastructure/agent_cli/
  __init__.py
  base.py
  claude.py
  codex.py
  factory.py
```

The analysis pipeline and MCP collector should depend on the provider interface, not raw CLI command construction.

## Future CLI Extensibility Memo

Adding another CLI agent should be additive after this change:

1. Add one provider file, for example `be/app/infrastructure/agent_cli/gemini.py`.
2. Implement that CLI's command shape behind `AgentCliProvider`.
3. Register it in `be/app/infrastructure/agent_cli/factory.py`.
4. Add the provider name to config validation.
5. Add focused tests for command construction, stdin handling, MCP listing, and error mapping.

The shared pipeline should not change for new CLI agents as long as the agent can satisfy the core contract: non-interactive prompt in, text or JSON out, and optional MCP source listing. If a future CLI cannot support MCP or requires streaming/interactive sessions, add explicit capability fields such as `supports_mcp` or `supports_stdin_prompt` instead of adding provider-specific branches in the pipeline.

## File Changes

### 1. `be/app/config.py`

Replace `cli_tool` with a provider-oriented name.

Current:

```python
class LLMSettings(BaseModel):
    cli_tool: Literal["claude", "codex"] = "claude"
    model: str = "claude-sonnet-4-6"
    timeout_seconds: int = 120
    max_retries: int = 2
```

Proposed:

```python
class LLMSettings(BaseModel):
    provider: Literal["claude", "codex"] = "claude"
    model: str = "claude-sonnet-4-6"
    timeout_seconds: int = 120
    max_retries: int = 2
```

Compatibility option:

- Keep `cli_tool` temporarily as deprecated input if migration risk is high.
- Internally map `cli_tool` to `provider`.

### 2. `be/config/default.yaml`

Current:

```yaml
llm:
  cli_tool: "claude"
  model: "claude-sonnet-4-6"
```

Proposed:

```yaml
llm:
  provider: "claude"
  model: "claude-sonnet-4-6"
  timeout_seconds: 120
  max_retries: 2
```

Codex local override example:

```yaml
llm:
  provider: "codex"
  model: "gpt-5.4"
```

### 3. `be/app/infrastructure/agent_cli/base.py`

Create shared types and protocol.

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AgentCliHealth:
    provider: str
    installed: bool
    authenticated: bool | None
    mcp_available: bool
    mcp_sources: list[str]
    errors: list[str]


class AgentCliError(Exception):
    pass


class AgentCliUnavailableError(AgentCliError):
    pass


class AgentCliTimeoutError(AgentCliError):
    pass


class AgentCliProvider(Protocol):
    name: str

    async def health_check(self) -> AgentCliHealth:
        ...

    async def list_mcp_sources(self) -> list[str]:
        ...

    async def run_prompt(
        self,
        prompt: str,
        model: str,
        timeout_seconds: int,
    ) -> str:
        ...
```

### 4. `be/app/infrastructure/agent_cli/claude.py`

Implement current Claude behavior inside an adapter.

Responsibilities:

- run `claude mcp list`
- run `claude --model <model> -p <prompt>`
- return stdout as text
- convert missing executable/timeouts/non-zero exit into provider errors

Command mapping:

```bash
claude mcp list
claude --model <model> -p <prompt>
```

### 5. `be/app/infrastructure/agent_cli/codex.py`

Implement Codex behavior inside an adapter.

Responsibilities:

- run `codex mcp list`
- run Codex non-interactively with `codex exec`
- prefer stdin for long prompts
- return final stdout as text
- convert missing executable/timeouts/non-zero exit into provider errors

Command mapping:

```bash
codex mcp list
codex exec --model <model> -
```

Use `-` and pass the prompt via stdin to avoid command-line length issues.

Recommended subprocess call:

```python
subprocess.run(
    ["codex", "exec", "--model", model, "-"],
    input=prompt.encode(),
    capture_output=True,
    timeout=timeout_seconds,
)
```

### 6. `be/app/infrastructure/agent_cli/factory.py`

Create the selected provider from settings.

```python
def create_agent_cli_provider(provider: str) -> AgentCliProvider:
    if provider == "claude":
        return ClaudeCliProvider()
    if provider == "codex":
        return CodexCliProvider()
    raise ValueError(f"Unsupported agent CLI provider: {provider}")
```

### 7. `be/app/infrastructure/collectors/llm_mcp.py`

Change constructor from executable fields to provider dependency.

Current:

```python
LLMMCPCollector(cli_tool=llm_settings.cli_tool, model=llm_settings.model)
```

Proposed:

```python
LLMMCPCollector(provider=agent_cli_provider, model=llm_settings.model)
```

Replace direct subprocess calls:

```python
await run_subprocess(self._cli, "mcp", "list", timeout=5)
await run_subprocess(*cmd, timeout=self._timeout)
```

with:

```python
available = await self._provider.list_mcp_sources()
raw_response = await self._provider.run_prompt(prompt, self._model, self._timeout)
```

Also reuse the stronger JSON extraction behavior from `llm_runner.py`, because agent CLIs may return fenced JSON or short preamble text.

### 8. `be/app/infrastructure/analysis/pipeline/llm_runner.py`

Change `call_llm` to depend on provider, not command shape.

Current:

```python
async def call_llm(cli_tool: str, model: str, prompt: str, ...)
```

Proposed:

```python
async def call_llm(provider: AgentCliProvider, model: str, prompt: str, ...)
```

Inside retry loop:

```python
raw = await provider.run_prompt(prompt, model, timeout_seconds)
```

Keep existing JSON parsing and retry behavior.

### 9. Pipeline Call Sites

Update these call sites to pass provider instead of `cli_tool`:

- `be/app/infrastructure/analysis/runner.py`
- `be/app/infrastructure/analysis/pipeline/p1_runner.py`
- `be/app/infrastructure/analysis/pipeline/p2_runner.py`
- `be/app/infrastructure/analysis/pipeline/p3_runner.py`
- `be/app/infrastructure/analysis/pipeline/scoring_runner.py`
- `be/app/infrastructure/analysis/pipeline/output_runner.py`
- `be/app/infrastructure/analysis/pipeline/p8_runner.py`

Keep model, timeout, and retry settings unchanged.

### 10. Optional Health Endpoint

Add:

```text
GET /api/v1/system/agent-cli-health
```

Response:

```json
{
  "data": {
    "provider": "codex",
    "installed": true,
    "authenticated": true,
    "mcp_available": true,
    "mcp_sources": ["linear", "notion"],
    "errors": []
  }
}
```

Files:

```text
be/app/interfaces/routers/system.py
be/app/interfaces/schemas/system.py
be/app/main.py
```

This endpoint is useful for UI/debuggability, but it can be deferred if the first implementation should stay smaller.

## Implementation Order

1. Add `agent_cli` provider package.
2. Implement Claude adapter using the current behavior.
3. Switch `llm_runner.py` to use the provider while keeping Claude behavior passing.
4. Switch `LLMMCPCollector` to use the provider.
5. Wire provider creation in `runner.py`.
6. Add Codex adapter.
7. Update config from `cli_tool` to `provider`.
8. Add tests for Claude and Codex command construction.
9. Update docs.
10. Optionally add health endpoint.

## Test Plan

Add or update tests in:

```text
be/tests/infrastructure/test_collectors.py
be/tests/infrastructure/test_agent_cli.py
be/tests/infrastructure/test_llm_runner.py
```

Required cases:

- Claude provider builds `claude --model <model> -p <prompt>`.
- Claude provider lists MCP sources with `claude mcp list`.
- Codex provider builds `codex exec --model <model> -`.
- Codex provider passes prompt via stdin.
- Codex provider lists MCP sources with `codex mcp list`.
- Missing executable becomes provider unavailable error.
- Non-zero CLI exit includes useful stderr in the error message.
- MCP collector can parse bare JSON.
- MCP collector can parse fenced JSON.
- Analysis runner fails clearly when selected provider is unavailable.

## Done Criteria

- `llm.provider: "claude"` preserves existing behavior.
- `llm.provider: "codex"` works through Codex CLI command shape.
- No analysis pipeline code constructs provider-specific CLI commands directly.
- Provider-specific behavior is isolated in adapter classes.
- Config and docs no longer imply Codex support without implementation.
- Tests cover both provider command shapes.
