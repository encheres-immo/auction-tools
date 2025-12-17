# AI Agent Guide (AGENTS.md)

## Purpose

This file provides essential guidelines and project context for AI agents (e.g., Claude, Codex) working on the **Enchères Immo Tools** codebase. Following these rules ensures that generated code, tests, and documentation integrate seamlessly with the existing project and meet the maintainability standards set by the development team.

## 1. Project Context

* **Repository**: `encheres-immo/auction-tools`
* **Stack**: TypeScript, pnpm workspaces, Vitest, esbuild.
* **Architecture**: pnpm monorepo with the following packages:
  * `packages/widget-client` → API client library (pure TypeScript)
  * `packages/auction-widget` → UI widget (SolidJS + TailwindCSS)
  * `example/` → Astro demo site
  * `docs/` → Documentation site (WIP)
* **Key principles**: type safety, functional patterns, tested code, reactive UI.

## 2. Coding Style

* **Idiomatic TypeScript**: Prefer clarity over cleverness; leverage the type system to catch errors at compile time.
* **Maintainability**: Small, single‑purpose functions; clear module boundaries; follow existing folder structure.
* **No unnecessary abstractions**: Only introduce patterns/interfaces when multiple concrete implementations exist.
* **Immutability**: Prefer `const` over `let`; avoid mutating objects and arrays.
* **Functional patterns**: Prefer pure functions; use `map`, `filter`, `reduce` over imperative loops.

## 3. TypeScript Best Practices

* **Strict mode is mandatory**: The `tsconfig.json` has `"strict": true`. Never bypass it with `@ts-ignore` or `any` unless absolutely necessary (and documented).
* **Explicit return types**: Always type function return values for public APIs.
* **Discriminated unions over enums**: Prefer union types (`type Status = "pending" | "active" | "closed"`) for better type narrowing.
* **Narrowing over casting**: Use type guards and narrowing instead of `as` assertions.
* **Generic constraints**: Use `extends` to constrain generics meaningfully.
* **Readonly by default**: Use `readonly` for properties and `ReadonlyArray<T>` when mutation is not needed.

## 4. Naming Conventions

| Element               | Convention       | Example                |
| --------------------- | ---------------- | ---------------------- |
| Types / Interfaces    | `PascalCase`     | `AuctionState`         |
| Functions / variables | `camelCase`      | `calculateFinalPrice`  |
| Constants             | `SCREAMING_CASE` | `DEFAULT_TIMEOUT_MS`   |
| Files (components)    | `PascalCase.tsx` | `BidForm.tsx`          |
| Files (utilities)     | `camelCase.ts`   | `utils.ts`             |

* Names **must be in English** and self‑descriptive—avoid cryptic abbreviations.

## 5. pnpm Workspace Guidelines

* **Workspace dependencies**: Use `workspace:*` for inter-package dependencies.
* **Root scripts**: Global commands live in the root `package.json`.
* **Package isolation**: Each package has its own `package.json`, `tsconfig.json`, and test configuration.
* **No hoisting issues**: If a package needs a dependency, declare it explicitly—don't rely on hoisting.
* **Changesets**: Use `pnpm changeset` for versioning before merging PRs that affect published packages.

## 6. Tests

* **Framework**: Vitest for all packages.
* **Unit tests** for pure functions and isolated modules.
* **Component tests** using `@solidjs/testing-library` for UI components.
* Tests assert observable **behaviour**, not internal implementation details.
* Keep test names descriptive: `it("should return highest bid when auction is active")`.
* **Coverage**: Aim for meaningful coverage—don't chase 100%, but cover critical paths.

## 7. User Interface & Internationalisation

* **Default language**: French.
* **UI components**: Reuse or extend existing SolidJS components; keep styling via TailwindCSS utility classes.
* **Accessibility**: Use semantic HTML and ARIA attributes where appropriate.

## 8. Comments & Documentation

* **Self‑documenting code first**: Choose expressive names and clear logic to eliminate needless comments.
* **When necessary**, keep comments concise, in English, explaining *why* not *how*.
* **JSDoc**: Use for public APIs and exported functions to enable IDE tooltips.

## 9. Leveraging Existing Docs

Before generating new code or documentation, parse repository markdown files (README, CONTRIBUTING, issue templates) to inherit existing conventions and avoid duplication.

## 10. Deliverables for Each Contribution

1. Production‑ready implementation code with proper types.
2. Comprehensive tests (unit + component).
3. Updated documentation if public API changed.
4. Brief pull‑request description summarising scope, rationale, and testing strategy.

## 11. Out of Scope

* Do **not** alter CI/CD configuration unless explicitly instructed.
* Avoid introducing external dependencies without strong justification and prior discussion.

## 12. Contact & Feedback

If the agent cannot resolve an ambiguity from existing sources, raise a comment in the pull request explaining the assumption or requesting clarification.

## 13. Mandatory Local Checks

Before submitting any code changes, run the following commands to ensure code quality and consistency:

**For the entire workspace:**
```bash
pnpm install              # Ensure dependencies are up to date
pnpm -r build             # Build all packages
pnpm -r test              # Run all tests
```

**For a specific package:**
```bash
cd packages/<package-name>
pnpm check                # Run all quality checks (see below)
```

Each package should have a `check` script that runs all quality checks in sequence:
```json
{
  "scripts": {
    "check": "tsc --noEmit && pnpm test run"
  }
}
```

*Follow this guide strictly to ensure AI‑generated contributions align with project standards and expedite human review.*
