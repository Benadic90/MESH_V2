# RESCUE-MESH V2 — Track 2 Project Status

## My Responsibility
I work only on Track 2: Backend and AI triage.
Do not modify Track 1 firmware or Track 3 frontend/docs unless I explicitly approve a change needed for backend integration.

## Project Location
`D:\BCA v sem\mesh\MESH_V2`

## Git Safety
- Current branch: `working`
- Last checked: 2026-10-19
- Branch was up to date with `origin/working` at that time.
- I have 8 modified tracked files and 3 untracked files.
- These changes are mine and must be preserved.
- Never reset, discard, stash, stage, commit, or push my changes without asking me first.

## Confirmed Requirements
- `POST /send_sos` must remain public.
- Never expose the admin token in browser code or public frontend environment variables.
- Follow the API, resource and SOS status contracts documented by the project.
- Offline functionality is required; verify the actual implementation rather than assuming it works.
- Hardware gateway response format and stable incident identity are awaiting confirmation from the hardware team.

## Working Rules
1. Explain tasks in simple, beginner-friendly English.
2. Give exact file paths and PowerShell commands.
3. Work on one small step at a time.
4. Inspect before editing.
5. Preserve existing behavior and my uncommitted changes.
6. Do not modify files until I approve the proposed change.
7. Run tests/builds only when appropriate and explain the command first.
8. Verify each step before moving to the next.

## Current Next Task
Compare project documentation with the actual Track 2 backend implementation in read-only mode.
Identify documented requirements, mismatches, and the smallest safe next backend task.
Do not implement anything until I approve.

## Update Log
- 2026-10-19: Backend started successfully; `/health` returned healthy; `/resources` returned 50 resources; test SOS creation and resource assignment were verified.
- Later review: Codex identified security, API contract, gateway integration and offline-sync items requiring verification.
- Current state must be rechecked before making changes.
