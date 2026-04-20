"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  createMember,
  createOrganization,
  createTeam,
  findMemberByGithubHandle,
  getOrgTeams,
  listOrganizations,
} from "@/features/analysis-chamber/api/analysis-chamber-api";
import type {
  ChamberOrganizationSummaryResponse,
  ChamberOrganizationTeamResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "enter" | "create";

type CreateStatus =
  | "idle"
  | "checking"
  | "creating_org"
  | "creating_team"
  | "creating_member"
  | "error";

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  "w-full min-h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed";

const labelCls =
  "block font-display text-[10px] uppercase tracking-[0.14em] text-white/50 mb-1.5";

const btnPrimary = (busy: boolean) =>
  `relative flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-5 font-display text-xs uppercase tracking-[0.16em] transition duration-200 active:scale-[0.98] ${
    busy
      ? "cursor-not-allowed border-white/10 bg-white/5 text-white/50"
      : "border-white/15 bg-white/8 text-white/90 hover:border-white/30 hover:brightness-110"
  }`;

const btnTab = (active: boolean) =>
  `cursor-pointer flex-1 rounded-md border px-4 py-2 font-display text-[10px] uppercase tracking-[0.14em] transition duration-150 ${
    active
      ? "border-white/25 bg-white/10 text-white/90"
      : "border-transparent text-white/40 hover:text-white/70"
  }`;

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    aria-hidden="true"
    className="h-3.5 w-3.5 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="3"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="3"
    />
  </svg>
);

// ─── Org/team loading skeleton ────────────────────────────────────────────────

const FieldSkeleton = ({ label }: { label: string }) => (
  <div>
    <span className={labelCls}>{label}</span>
    <div
      className={`${inputCls} flex items-center gap-2 opacity-50`}
      aria-busy="true"
    >
      <Spinner />
      <span className="text-xs text-white/40">Loading…</span>
    </div>
  </div>
);

// ─── Enter panel ──────────────────────────────────────────────────────────────

// Approach: accept GitHub handle (external_id) instead of raw member UUID.
// Scans org trees via GET /organizations → GET /organizations/:orgId and matches
// on external_id. Replace with GET /members?external_id=<handle> once backend adds it.
const EnterPanel = ({ onSwitchToCreate }: { onSwitchToCreate: () => void }) => {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "not_found">(
    "idle",
  );
  const normalizedHandle = useMemo(() => handle.trim(), [handle]);
  const canSubmit = normalizedHandle.length > 0 && status !== "loading";
  const isLoading = status === "loading";

  const openChamber = async () => {
    if (!canSubmit) return;
    setStatus("loading");
    try {
      const memberId = await findMemberByGithubHandle(normalizedHandle);
      if (!memberId) {
        setStatus("not_found");
        return;
      }
      router.push(`/profile/${encodeURIComponent(memberId)}`);
    } catch {
      setStatus("not_found");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void openChamber();
        }}
      >
        <div className="flex-1">
          <label className={labelCls} htmlFor="gh-handle-enter">
            GitHub username
          </label>
          <input
            className={inputCls}
            disabled={isLoading}
            id="gh-handle-enter"
            onChange={(e) => {
              setStatus("idle");
              setHandle(e.target.value);
            }}
            placeholder="octocat"
            value={handle}
          />
        </div>
        <button
          className={`${btnPrimary(isLoading)} sm:mt-[22px] sm:w-auto sm:min-w-[160px]`}
          disabled={!canSubmit}
          type="submit"
        >
          {isLoading && <Spinner />}
          {isLoading ? "Searching…" : "Open chamber"}
        </button>
      </form>

      {status === "not_found" && (
        <p className="text-xs text-red-400/80">
          No member found for &ldquo;{normalizedHandle}&rdquo;.{" "}
          <button
            className="cursor-pointer underline underline-offset-2 hover:text-red-300"
            onClick={onSwitchToCreate}
            type="button"
          >
            Create profile
          </button>{" "}
          to register them first.
        </p>
      )}
    </div>
  );
};

// ─── Create panel ─────────────────────────────────────────────────────────────

const CREATE_STEP_LABELS: Record<CreateStatus, string> = {
  idle: "Create & open",
  checking: "Checking username…",
  creating_org: "Creating organisation…",
  creating_team: "Creating team…",
  creating_member: "Creating member…",
  error: "Create & open",
};

// Step order for progress bar
const STEPS: Exclude<CreateStatus, "idle" | "error">[] = [
  "checking",
  "creating_org",
  "creating_team",
  "creating_member",
];

const CreatePanel = ({ onSwitchToEnter }: { onSwitchToEnter: () => void }) => {
  const router = useRouter();

  // Org + team data
  const [orgs, setOrgs] = useState<ChamberOrganizationSummaryResponse[]>([]);
  const [teams, setTeams] = useState<ChamberOrganizationTeamResponse[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [orgMode, setOrgMode] = useState<"select" | "new">("select");
  const [orgId, setOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [teamMode, setTeamMode] = useState<"select" | "new">("new");
  const [teamId, setTeamId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  // Submit state
  const [createStatus, setCreateStatus] = useState<CreateStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubmitting = createStatus !== "idle" && createStatus !== "error";
  const normalizedHandle = githubHandle.trim();

  // Load orgs on mount
  useEffect(() => {
    listOrganizations()
      .then((list) => {
        setOrgs(list);
        if (list.length === 0) setOrgMode("new");
      })
      .catch(() => setOrgMode("new"))
      .finally(() => setOrgsLoading(false));
  }, []);

  // Load teams when org selection changes
  // Bug-fix: always reset teamMode to "new" when clearing teams so the
  // validation guard in handleCreate never fires a false early-return.
  useEffect(() => {
    if (orgMode !== "select" || !orgId) {
      setTeams([]);
      setTeamId("");
      setTeamMode("new"); // ← critical: prevents stale "select" mode failing validation
      return;
    }
    setTeamsLoading(true);
    setTeams([]);
    setTeamId("");
    setTeamMode("new");
    getOrgTeams(orgId)
      .then((list) => {
        setTeams(list);
        setTeamMode(list.length > 0 ? "select" : "new");
      })
      .catch(() => setTeamMode("new"))
      .finally(() => setTeamsLoading(false));
  }, [orgId, orgMode]);

  // Derived: which "effective team mode" should validation use?
  // If teams haven't loaded yet or are empty, always treat as "new".
  const effectiveTeamMode: "select" | "new" =
    teamMode === "select" && teams.length > 0 ? "select" : "new";

  // Form validity for submit button
  const formIsValid = useMemo(() => {
    if (!displayName.trim() || !normalizedHandle) return false;
    if (orgMode === "select" && !orgId) return false;
    if (orgMode === "new" && !newOrgName.trim()) return false;
    if (effectiveTeamMode === "select" && !teamId) return false;
    if (effectiveTeamMode === "new" && !newTeamName.trim()) return false;
    return true;
  }, [
    displayName,
    normalizedHandle,
    orgMode,
    orgId,
    newOrgName,
    effectiveTeamMode,
    teamId,
    newTeamName,
  ]);

  const handleCreate = async () => {
    if (!formIsValid || isSubmitting) return;

    setCreateStatus("checking");
    setErrorMsg(null);

    try {
      // Dedup: if handle already exists anywhere, go to that profile
      const existingId = await findMemberByGithubHandle(normalizedHandle);
      if (existingId) {
        router.push(`/profile/${encodeURIComponent(existingId)}`);
        return;
      }

      // Resolve org
      let finalOrgId = orgId;
      if (orgMode === "new") {
        setCreateStatus("creating_org");
        const org = await createOrganization(newOrgName.trim());
        finalOrgId = org.organization_id;
      }

      // Resolve team
      let finalTeamId = teamId;
      if (effectiveTeamMode === "new") {
        setCreateStatus("creating_team");
        const team = await createTeam(finalOrgId, newTeamName.trim());
        finalTeamId = team.team_id;
      }

      // Create member
      setCreateStatus("creating_member");
      const member = await createMember(finalOrgId, finalTeamId, {
        display_name: displayName.trim(),
        external_id: normalizedHandle,
      });

      router.push(`/profile/${encodeURIComponent(member.member_id)}`);
    } catch (err) {
      setCreateStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // Progress bar — which step are we on?
  const currentStepIndex = STEPS.indexOf(
    createStatus as Exclude<CreateStatus, "idle" | "error">,
  );

  const orgVisible = !orgsLoading;
  const teamVisible =
    orgVisible &&
    (orgMode === "new" ? newOrgName.trim().length > 0 : orgId.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Display name + GitHub handle */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="create-display-name">
            Display name
          </label>
          <input
            className={inputCls}
            disabled={isSubmitting}
            id="create-display-name"
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane Doe"
            value={displayName}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="create-gh-handle">
            GitHub username
          </label>
          <input
            className={inputCls}
            disabled={isSubmitting}
            id="create-gh-handle"
            onChange={(e) => setGithubHandle(e.target.value)}
            placeholder="octocat"
            value={githubHandle}
          />
        </div>
      </div>

      {/* Org field */}
      {orgsLoading ? (
        <FieldSkeleton label="Organisation" />
      ) : (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={labelCls.replace("mb-1.5", "")}>Organisation</span>
            {orgs.length > 0 && (
              <button
                className="cursor-pointer font-display text-[9px] uppercase tracking-widest text-white/40 transition hover:text-white/70 disabled:pointer-events-none disabled:opacity-30"
                disabled={isSubmitting}
                onClick={() => {
                  setOrgMode(orgMode === "select" ? "new" : "select");
                  setOrgId("");
                  setNewOrgName("");
                }}
                type="button"
              >
                {orgMode === "select" ? "+ New org" : "← Select existing"}
              </button>
            )}
          </div>
          {orgMode === "select" ? (
            <select
              className={`${inputCls} cursor-pointer`}
              disabled={isSubmitting}
              onChange={(e) => setOrgId(e.target.value)}
              value={orgId}
            >
              <option value="">Select an organisation</option>
              {orgs.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputCls}
              disabled={isSubmitting}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organisation name (will be created)"
              value={newOrgName}
            />
          )}
        </div>
      )}

      {/* Team field — revealed after org is resolved */}
      {teamVisible &&
        (teamsLoading ? (
          <FieldSkeleton label="Team" />
        ) : (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className={labelCls.replace("mb-1.5", "")}>Team</span>
              {orgMode === "select" && teams.length > 0 && (
                <button
                  className="cursor-pointer font-display text-[9px] uppercase tracking-widest text-white/40 transition hover:text-white/70 disabled:pointer-events-none disabled:opacity-30"
                  disabled={isSubmitting}
                  onClick={() => {
                    setTeamMode(teamMode === "select" ? "new" : "select");
                    setTeamId("");
                    setNewTeamName("");
                  }}
                  type="button"
                >
                  {teamMode === "select" ? "+ New team" : "← Select existing"}
                </button>
              )}
            </div>
            {effectiveTeamMode === "select" ? (
              <select
                className={`${inputCls} cursor-pointer`}
                disabled={isSubmitting}
                onChange={(e) => setTeamId(e.target.value)}
                value={teamId}
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputCls}
                disabled={isSubmitting}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name (will be created)"
                value={newTeamName}
              />
            )}
          </div>
        ))}

      {/* Progress steps — visible while submitting */}
      {isSubmitting && (
        <div className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/3 px-3 py-2.5">
          {STEPS.map((step, i) => {
            const done = currentStepIndex > i;
            const active = currentStepIndex === i;
            return (
              <div key={step} className="flex items-center gap-1.5">
                <span
                  className={`font-display text-[9px] uppercase tracking-widest transition-colors duration-200 ${
                    active
                      ? "text-white/80"
                      : done
                        ? "text-white/40"
                        : "text-white/20"
                  }`}
                >
                  {active && <Spinner />}
                  {CREATE_STEP_LABELS[step].replace("…", "")}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-white/15">›</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <p className="rounded-md border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400/90">
          {errorMsg}
        </p>
      )}

      {/* Dedup hint */}
      <p className="text-[10px] leading-4 text-white/25">
        If this GitHub username already exists in any org, you will be routed to
        their existing profile instead of creating a duplicate.
      </p>

      {/* Submit */}
      <button
        className={btnPrimary(isSubmitting || !formIsValid)}
        disabled={isSubmitting || !formIsValid}
        onClick={() => void handleCreate()}
        type="button"
      >
        {isSubmitting && <Spinner />}
        {CREATE_STEP_LABELS[createStatus]}
      </button>

      <p className="text-center text-[10px] text-white/25">
        Already registered?{" "}
        <button
          className="cursor-pointer underline underline-offset-2 hover:text-white/60"
          onClick={onSwitchToEnter}
          type="button"
        >
          Enter username directly
        </button>
      </p>
    </div>
  );
};

// ─── Main launcher ────────────────────────────────────────────────────────────

export const AnalysisChamberLauncher = () => {
  const [mode, setMode] = useState<Mode>("enter");

  return (
    <div className="w-full max-w-xl">
      {/* Mode tabs */}
      <div
        className="mb-5 flex gap-1 rounded-lg border p-1"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <button
          className={btnTab(mode === "enter")}
          onClick={() => setMode("enter")}
          type="button"
        >
          Enter username
        </button>
        <button
          className={btnTab(mode === "create")}
          onClick={() => setMode("create")}
          type="button"
        >
          Create profile
        </button>
      </div>

      {mode === "enter" ? (
        <EnterPanel onSwitchToCreate={() => setMode("create")} />
      ) : (
        <CreatePanel onSwitchToEnter={() => setMode("enter")} />
      )}
    </div>
  );
};
