# Commit rules

All commits must be in English and use the following prefixes:

- `init:` — starting a project or new functionality
- `feat:` — new feature visible to the user
- `fix:` — bug fix affecting the user
- `refactor:` — code restructuring without changing functionality
- `chore:` — maintenance tasks (dependencies, config, cleanup)
- `docs:` — documentation changes
- `style:` — formatting and code style only (no logic changes)
- `perf:` — performance improvements
- `vendor:` — dependency updates
- `test:` — adding or modifying tests
- `minor:` — small changes with negligible impact

## Workflow

When I type "commit":
1. Run `git diff` and `git status` to analyze all changes
2. Propose a commit message with the appropriate prefix
3. Show the proposed message and ask for approval:
   "Proposed commit: `feat: add user authentication flow` — approve? (yes / edit / cancel)"
4. Wait for my response:
   - yes → run `git add -A` and `git commit -m "..."` to the current branch
   - edit → let me provide the corrected message, then commit
   - cancel → do nothing
5. Never commit without explicit approval
6. Never run `git push` unless I explicitly ask

## Format

`<prefix>: <short description in lowercase, present tense, max 72 chars>`
