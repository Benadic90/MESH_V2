# RESCUE-MESH V2 — Track 2 Project Status

## My Responsibility
I work only on Track 2: Backend and AI triage.
Do not modify Track 1 firmware or Track 3 frontend/docs unless I explicitly approve a change needed for backend integration.

## Project Location
`D:\BCA v sem\mesh\MESH_V2`

## Git Safety
- Current branch: `fix/critical-entrapment-priority`
- Last checked: 2026-10-23
- Local branch matches `origin/fix/critical-entrapment-priority` at `37142b3e3cd26d093af8e35c2f8b9027eafd4f8b`.
- Working tree was clean before this status update.
- PR #4 is open and not merged: https://github.com/Benadic90/MESH_V2/pull/4
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
Coordinate the `/resources` response contract with Track 3 before changing backend behavior. The active Track 2 instructions specify `id`, `type`, `status`, `lat`, and `lng`, while `backend/src/types.ts` and `GET /resources` currently use `id`, `name`, `type`, `area`, and `available`; the backend currently has no resource coordinates to return. Confirm whether coordinates/status are expected from backend-owned fleet data or another source. Do not invent resource data or alter the contract until confirmed.

Other verified integration work still pending:
- Decide how the frontend can use admin-protected request lookup and Socket.IO without exposing `ADMIN_API_TOKEN` in browser code.
- Reconcile the documented `resolved` status with `backend/src/types.ts`, which currently supports only `pending` and `assigned`.
- Align the frontend Yjs map key (`requests`) with the Track 2 instruction key (`rescue-mesh-requests`) and define how cached Yjs SOS records reach the backend ledger. Local IndexedDB/Yjs caching exists, but backend import/merge is not wired in the inspected code.
- Keep gateway response schema and stable incident identity unconfirmed until Track 1 verifies the real device contract.

The requested documentation-to-code comparison has been completed. No implementation change is authorized by this status update.

## Update Log
- 2026-10-19: Backend started successfully; `/health` returned healthy; `/resources` returned 50 resources; test SOS creation and resource assignment were verified.
- Later review: Codex identified security, API contract, gateway integration and offline-sync items requiring verification.
- 2026-10-23: PR #4 priority fix was reviewed. For the regression case, score is 80 with entrapment weight 35 and 85 with weight 40; TypeScript and Python weights match. Backend tests (10/10), TypeScript build, and `python src/ai_engine.py` passed on commit `7a7f395d632373d166c748149465d7306766f2fe`.
- 2026-10-23: Added an authenticated single-SOS lookup test for `GET /get_requests?id=...`: missing authentication returns 401, a valid admin token returns the matching SOS, and an unknown ID returns 404. The focused test, full backend suite (11 tests), TypeScript build, and `git diff --check` passed. Investigated the documented `/resources` field mismatch; implementation is deferred pending Track 3 clarification on resource IDs, status semantics, and coordinate sources.
- 2026-10-23: Commit `37142b3e3cd26d093af8e35c2f8b9027eafd4f8b` is pushed and PR #4 remains open. GitHub Actions Track 2 Backend CI completed successfully for that commit. Despite the commit message, its changed files are only this status document and `backend/src/__pycache__/ai_engine.cpython-314.pyc`; no backend test file changed. The Python bytecode file was generated when the Python mirror command was run during verification; it is an unintended generated artifact in the PR and should be removed from version control in a follow-up approved by the user.
- Current branch and working-tree state must be rechecked before future changes.
