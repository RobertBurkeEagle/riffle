# Quickstart Validation: Core Learning Loop

Use this after implementing 001 tasks. Expect ~10 minutes.

## Setup

1. Open the app in a fresh browser profile or clear `localStorage` keys `riffle.*`.
2. Confirm auth gate is visible.

## Path A — New account

1. Create profile with name, email, password (≥4 chars).
2. Complete 3 skill-check questions → Finish.
3. On Profile, select ≥1 genre, set skill if needed, Save.
4. Generate Roadmap → confirm ≥5 milestones appear.
5. Open first milestone → steps visible → mark a step done if UI supports it (or complete lesson CTA).
6. Open Practice → start chord exercise → change difficulty → transpose ±1 → log/complete.
7. Dashboard shows next action, skill, genres, and a recent practice item.
8. Reload page → still signed in with same state.
9. Sign out → auth gate returns.

## Path B — Guest

1. Continue as guest → skill check → set a genre → generate roadmap.
2. Confirm guest labeling in sidebar.
3. Reload → guest session restores if session key retained.

## Path C — Failure cases

1. Signup with duplicate email → clear error.
2. Sign-in with wrong password → generic failure.
3. Roadmap generate with zero genres → blocked with guidance.
4. Transpose repeatedly until clamp → UI indicates limit.

## Pass criteria

All Path A steps succeed; Path B reaches roadmap; Path C shows intended errors without crash.
