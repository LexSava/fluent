# Fluent — Claude Code rules

@.claude/skills/workflow.md
@.claude/skills/design.md
@.claude/skills/commit.md

## Reading skills

### Project-specific skills (read these first, they override general rules)

.claude/skills/commit.md
  Read when: user types "commit" or asks to make a git commit
  Do NOT read for any other tasks

.claude/skills/design.md
  Read when: creating or modifying any UI component, page, or style
  Do NOT read for backend logic, API routes, or database tasks

.claude/skills/workflow.md
  Read when: starting a new feature, planning a task, or user asks about process
  Do NOT read for bug fixes or small isolated changes

.claude/skills/ui-ux-pro-max
  Read when: user explicitly asks for UX/UI analysis or design review
  Do NOT read automatically when writing components

### Global skills from /mnt/skills/ (read only when local skills are not enough)

/mnt/skills/public/frontend-design/SKILL.md
  Read when: local design.md does not cover the specific case

/mnt/skills/public/file-reading/SKILL.md
  Read when: user uploads a file that needs to be processed

All other /mnt/skills/ files: read only when explicitly needed
for docx, pdf, pptx, xlsx creation tasks.

### Rules
- Always check .claude/skills/ before /mnt/skills/
- Read skill files once per session, not before every subtask
- If the skill was already read in this session — do not read it again
- Never read all skills at once — only the one relevant to current task

## Context efficiency

Read only files that are directly relevant to the current task.
When fixing a bug in one component — do not read unrelated components.
When adding a feature — read only files that will be modified.
Ask which files are needed before reading the entire project.

## Token efficiency

### When reading files
Read only files directly relevant to the current task.
Do not read the entire project structure for simple tasks.
Use grep to find specific code instead of reading whole files:
  grep -r "functionName" src/ --include="*.ts"
Do not re-read files that were already shown in the current session.

### When writing code
Do not repeat unchanged code — use comments like:
  // ... rest of the component stays the same
Only show the specific function or block being changed.
For small edits use str_replace instead of rewriting the whole file.

### When explaining
Do not explain what you are about to do before doing it.
Do not summarize what you just did after doing it.
Just do the task and report the result.

### When running commands
Combine related commands into one line where possible:
  npx prisma generate && npx tsc --noEmit
Do not run npm run dev to verify after every small change —
only run it when explicitly asked or after significant changes.

### Response format
Answer in the same language the user used.
No unnecessary preamble before the answer.
No lengthy conclusions after completing the task.
Report errors immediately, do not attempt more than 2 auto-fixes.
If stuck — stop and ask instead of trying indefinitely.
