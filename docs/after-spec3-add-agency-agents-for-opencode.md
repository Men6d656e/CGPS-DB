# 🤖 After SPEC3 — OpenCode Agency Agents

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(opencode): add agency agents library for opencode`

## What is this?

After the SPEC3 shadcn/UI migration was completed (all 6 phases shipped), a
library of **custom AI agents for [OpenCode](https://opencode.ai)** (the
open-source AI coding agent CLI) was added to the repository so the project can
be worked on by an "agency" of specialized subagents — engineering, security,
testing, design, marketing, and more.

## Where it lives

```
.opencode/
├── agents/            # 269 agent definitions (Markdown, one per agent)
├── package.json       # plugin manifest — depends on @opencode-ai/plugin@1.15.3
├── package-lock.json
└── .gitignore         # keeps node_modules + package files out of git
```

> **Note:** only `.opencode/agents/` is committed to the repo (per the nested
> `.gitignore`). The `@opencode-ai/plugin` dependency and its `node_modules`
> stay local — the agent `.md` files work standalone without them.

## Agent format

Every agent is a Markdown file with YAML frontmatter, e.g.
`.opencode/agents/engineering-ai-engineer.md`:

```markdown
---
name: AI Engineer
description: Expert AI/ML engineer specializing in model development, deployment...
mode: subagent
color: '#3498DB'
---

# AI Engineer Agent

You are an **AI Engineer**...
```

- `name` — display name shown in the CLI
- `description` — when this agent should be used (shown when invoked)
- `mode: subagent` — runs as a delegated sub-agent rather than the main agent
- `color` — UI accent for the agent
- Body — the full system prompt: identity, mission, capabilities, workflows

## How to use them

Run OpenCode in the project root and reference an agent by name with `@`:

```bash
opencode
# then in the prompt, e.g.:
#   @AI Engineer review the ML pipeline in school-backend
#   @Security Penetration Tester audit the new auth flow
#   @Engineering Code Reviewer review the SPEC3 UI changes
```

OpenCode discovers agents automatically from `.opencode/agents/*.md`.

## Agent catalog (by domain)

| Domain | Examples |
|---|---|
| **Engineering** | AI Engineer, Backend Architect, Frontend Developer, Senior Developer, Software Architect, SRE, DevOps Automator, Git Workflow Master, Code Reviewer, Database Optimizer, API Platform Engineer, RAG Pipeline Engineer, Rust Refactoring Specialist |
| **Security** | Security Architect, AppSec Engineer, Penetration Tester, Secrets & Credential Engineer, Cloud Security Architect, Compliance Auditor, Threat Intelligence Analyst, Incident Responder |
| **Testing** | Test Automation Engineer, API Tester, Accessibility Auditor, Performance Benchmarker, Evidence Collector, Test Results Analyzer |
| **Design / UX** | UI Designer, UX Architect, UX Researcher, Visual Storyteller, Brand Guardian, Inclusive Visuals Specialist |
| **Data / AI** | Data Engineer, Data Visualization Engineer, AI Data Remediation Engineer, Search Relevance Engineer, LLM Post-Training Engineer, Prompt Engineer |
| **Project / Product** | Project Shepherd, Senior Project Manager, Product Manager, Sprint Prioritizer, Jira Workflow Steward, Meeting Notes Specialist |
| **Marketing / Sales** | SEO Specialist, Content Creator, Social Media Strategist, Growth Hacker, PPC Strategist, Sales Pipeline Analyst, Deal Strategist |
| **Finance / Legal** | CFO, Financial Analyst, Tax Strategist, Bookkeeper/Controller, Legal Document Review, Compliance Checker |
| **GIS / XR / Games** | GIS Analyst, Web GIS Developer, 3D Scene Developer, Unity/Unreal/Godot/Roblox specialists, XR & VisionOS engineers |
| **Support / Ops** | Support Responder, Analytics Reporter, Infrastructure Maintainer, Operations Manager, Incident Response Commander |

## Adding a new agent

1. Create `.opencode/agents/<domain>-<role>.md`
2. Add frontmatter (`name`, `description`, `mode: subagent`, `color`)
3. Write the system prompt (identity, mission, capabilities, workflow)
4. Commit + push — OpenCode picks it up automatically

## Why after SPEC3?

SPEC1 → SPEC2 → SPEC3 established a repeatable **Code → Test → Docs → README →
Commit → Push** workflow. With the UI now fully on shadcn/ui and all test suites
green (pytest 26, vitest 7, eslint 0), the next iteration of the project can be
driven by specialized OpenCode agents from this library — each owning a domain
instead of one generic assistant doing everything.
