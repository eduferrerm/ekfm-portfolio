---
description: Structured breakdown of the current diff for review (title / description / files / priority / deltas)
---

Produce a review-friendly breakdown of changes so the reviewer can triage fast and ask targeted questions.

**Always start the output with a top-level `# Review Breakdown` heading** (verbatim, so it's searchable in terminal scrollback), optionally followed by the target scope on the same line.

**Target diff:** $ARGUMENTS — if given (a ref, range, or path), scope to that. Default: everything uncommitted vs `HEAD`, including untracked files.

**Steps:**
1. Run `git diff --stat <target>` and `git status --porcelain` to get accurate file lists, +/− line deltas, and untracked files. Read new/changed files as needed to describe them precisely — never guess deltas or behavior.
2. Group changes into **logical units** (a unit may span several files; a single file may split across units). Do NOT default to one-group-per-file.
3. Output each group in this exact format:
   - **N. Title** — short, what the unit does
   - **Description:** one or two sentences of intent
   - **File(s):** path(s) with +/− counts; mark new files
   - **Review priority:** HIGH / MEDIUM / LOW — flag generated or mechanical output (codegen, lockfiles, type output) as LOW
   - delta bullets — concrete and specific (name the fields, functions, flags, behavior changes), not vague summaries
4. After the groups, add:
   - a short **"Not in the diff but done"** note covering DB/schema pushes, side effects, or manual steps that won't show in the diff
   - 1–3 **likely review questions** the reviewer may raise, each with its rationale

Keep it scannable; lead with the highest-priority groups when it helps. End by offering to expand any group into a full file-by-file walkthrough.
