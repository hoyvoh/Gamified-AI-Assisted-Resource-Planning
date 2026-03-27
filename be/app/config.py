"""Application configuration.

Single source of truth: config/default.yaml
All constants are defined there — not here. This file only defines the shape.

Load order (highest priority wins):
  1. Environment variables       (e.g. COCOMO__A=3.0)
  2. config/local.yaml           (gitignored — local dev overrides)
  3. config/default.yaml         (committed — all defaults live here)

Nested keys map to env vars with __ separator:
  cocomo.a              → COCOMO__A
  llm.anthropic_api_key → LLM__ANTHROPIC_API_KEY

If config/default.yaml is missing or a required key is absent, startup fails
with a clear validation error rather than silently using stale hardcoded values.
"""

from typing import Literal

from pydantic import BaseModel
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
    YamlConfigSettingsSource,
)


class CocomoSettings(BaseModel):
    """Shape only — values come from config/default.yaml."""

    a: float
    b: float
    working_days_per_month: float


class LLMSettings(BaseModel):
    """Shape only — values come from config/default.yaml.

    LLM operations are performed via CLI subprocess (claude / codex), not direct API calls.
    No API keys are stored or managed here — authentication is handled by the CLI tool itself
    (e.g. `claude auth login`, `codex auth`).
    """

    cli_tool: Literal["claude", "codex"]
    model: str  # Passed as --model flag when supported by the CLI


class OptimizerSettings(BaseModel):
    """Shape only — values come from config/default.yaml."""

    population: int
    generations: int


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        yaml_file=["config/default.yaml", "config/local.yaml"],
        yaml_file_encoding="utf-8",
        env_nested_delimiter="__",
        env_file=".env",
    )

    database_url: str
    secret_key: str
    debug: bool = False  # optional flag, False is a safe default

    cocomo: CocomoSettings
    llm: LLMSettings
    optimizer: OptimizerSettings

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            env_settings,
            dotenv_settings,
            YamlConfigSettingsSource(settings_cls),
            file_secret_settings,
        )


settings = Settings()
