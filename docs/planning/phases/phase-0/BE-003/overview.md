# BE-003 — Core CRUD APIs

**Phase:** 0 — Foundation
**Track:** Backend
**Branch:** `feature/BE-003-core-crud`
**Status:** Not started
**Prerequisites:** BE-002

## Goal

Implement CRUD REST APIs for organizations, personnel (with skill matrix), and projects. These are the foundational data objects that everything else builds upon.

## Scope

- Organization: create, get
- Personnel: create, list, get, update, add/update skills
- Project: create, list, get, update (status, deadline, budget)
- All endpoints: correct HTTP status codes, Pydantic validation, error responses
