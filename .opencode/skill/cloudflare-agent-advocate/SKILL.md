# Cloudflare Agent Advocate Skill

---
name: cloudflare-agent-advocate
description: Document Cloudflare Agents SDK confusion points with detailed AI reasoning and resolution paths
license: MIT
compatibility: opencode
metadata:
  product: cloudflare-agents-sdk
  audience: cloudflare-workers-team
  focus: ai-agent-development-experience
  version: "1.0.0"
---

## Purpose

This skill helps AI agents document their experience working with the Cloudflare Agents SDK, capturing moments of confusion, assumptions that turned out wrong, and the journey to finding solutions. Unlike general product feedback, this focuses specifically on the **AI agent's perspective** during development with Cloudflare Workers and Agents.

## When to Use This Skill

Invoke this skill when encountering:

1. **Type System Confusion**
   - TypeScript types not working as expected
   - Missing or unclear type definitions
   - Generic constraints causing issues
   - Type inference problems

2. **Documentation Gaps**
   - Examples missing for common patterns
   - API documentation unclear or incomplete
   - Migration guides outdated
   - Conflicting information between sources

3. **SDK API Surprises**
   - Methods behaving differently than documented
   - Imports or module resolution issues
   - Decorator usage unclear
   - Context/environment access patterns confusing

4. **Trial and Error Resolutions**
   - Took 3+ attempts to solve something
   - Found solution not documented anywhere
   - Discovered workarounds that should be official patterns
   - Hit edge cases not covered in docs

## DO NOT Use This Skill For

- Runtime bugs in user code
- Issues with user's environment setup (unless Cloudflare SDK-related)
- General TypeScript questions unrelated to Cloudflare
- Expected behavior that worked correctly
- User mistakes that aren't SDK-related

## How to Invoke

```
/cloudflare-agent-advocate
```

Or with context:

```
I need to document my confusion with the Agents SDK. [Describe what happened]
```

## Instructions for the Agent

When this skill is invoked, systematically document the experience following these steps:

### Step 1: Initialize and Prepare

**CRITICAL FIRST STEPS:**

1. Create directory if needed:
   ```bash
   mkdir -p product-feedback
   ```

2. Check `.gitignore`:
   ```bash
   grep -q "product-feedback/" .gitignore || echo -e "\n# Product feedback reports for Cloudflare\nproduct-feedback/" >> .gitignore
   ```

3. Determine report filename:
   ```
   product-feedback/YYYY-MM-DD-brief-description.md
   ```

### Step 2: Gather the Story

Reconstruct what happened by asking yourself:

**The Task:**
- What was I trying to accomplish?
- What was the user's request?
- What feature or functionality was being implemented?

**The Assumptions:**
- What did I think would work?
- Why did I think that? (training data, similar patterns, documentation)
- What was my initial approach?

**The Context:**
- What files did I have access to?
- What documentation did I search?
- What tools or MCP servers did I use?
- What was the state of the codebase?

**The Confusion:**
- What went wrong first?
- What error messages appeared?
- How many different approaches did I try?
- What finally worked?

### Step 3: Document the Journey Chronologically

For each attempt made:

```markdown
### Attempt #N: [Brief description]

**What I Tried:**
\```typescript
// The code I attempted
\```

**My Reasoning:**
[Why I thought this would work]

**What Happened:**
\```
Error messages or unexpected behavior
\```

**Why This Failed:**
[My analysis of the failure]

**What This Taught Me:**
[Key learning from this attempt]
```

Continue for each iteration until reaching the solution.

### Step 4: Analyze the Documentation Trail

For each documentation source consulted:

```markdown
### [Source Name]
- **URL:** [link]
- **What I Was Looking For:** [specific information needed]
- **What I Found:** [what was actually there]
- **What Was Missing:** [information I needed but wasn't there]
- **How Helpful (1-5):** [rating]
```

### Step 5: Identify the Root Cause

Determine what the actual issue was:

- **Outdated documentation** - Examples or API changed
- **Missing documentation** - Pattern not documented at all
- **Unclear types** - TypeScript definitions confusing or wrong
- **Hidden assumptions** - Undocumented requirements or setup
- **API design** - SDK design makes common tasks difficult
- **Tool/build config** - Configuration not obvious

### Step 6: Craft Recommendations

For each improvement area:

**Documentation Updates:**
- Specific page or section to update
- Draft the improved content
- Explain why it helps

**Type Definition Improvements:**
- Show current problematic type
- Suggest improved version
- Explain benefits

**New Examples Needed:**
- Describe the use case
- Write a complete working example
- Explain what it demonstrates

**API Design Feedback:**
- Constructive criticism
- Alternative approaches
- Benefits of changes

### Step 7: Write the Report

Use this complete template:

```markdown
# Cloudflare Agents SDK Feedback Report

**Date:** YYYY-MM-DD
**Reporter:** OpenCode AI Agent
**Product:** [Agents SDK / Workers / Durable Objects / etc.]
**Category:** [Types / Documentation / API / Examples / Build Config]
**Severity:** [Critical / High / Medium / Low]

---

## Summary

[2-3 sentence description of what was confusing and why it matters]

---

## Context: What I Was Trying To Do

**User Request:**
> [Quote the user's ask]

**My Understanding:**
[What I thought needed to happen to fulfill the request]

**Expected Complexity:**
[Did I think this would be straightforward or tricky?]

---

## AI Agent's Thought Process

### Initial Assumptions

**What I Expected to Work:**
\```typescript
// My first attempted approach
\```

**Why I Expected This:**
- [Reasoning based on training data / similar patterns]
- [What documentation or examples informed this]
- [What analogies I drew from other frameworks]

### Context Available at the Time

**Files Read:**
- `path/to/file.ts` (lines X-Y) - [what I learned from it]
- `path/to/other.ts` (full file) - [what I learned from it]

**Documentation Sources Searched:**
- [Cloudflare Docs URL] - [Searched for: X, Found: Y]
- [GitHub Issues] - [Searched for: X, Found: Y]
- [Package README] - [What I expected vs. what was there]

**MCP Servers / Tools Used:**
- [cloudflare-docs MCP] - [Query: X, Result: Y]
- [grep tool] - [Searched for: X in Y files]

**Codebase State:**
- [Describe relevant context about the project]
- [What was already working]
- [What I was adding]

---

## The Confusion Journey

[Document each attempt chronologically]

### Attempt #1: [Brief description]

**What I Tried:**
\```typescript
// Code I attempted
\```

**My Reasoning:**
[Why I thought this would work]

**What Happened:**
\```
Error message or unexpected behavior
\```

**Why This Failed:**
[My analysis]

**Time Spent:** ~[X] minutes

---

### Attempt #2: [Brief description]

[Same structure...]

---

### Attempt #N: The Solution

**What Finally Worked:**
\```typescript
// Working code
\```

**Why This Works:**
[Explanation of why this is the correct approach]

**The Aha Moment:**
[What was the key insight that unlocked the solution?]

**Time Spent on This Attempt:** ~[X] minutes

---

## Documentation Trail Analysis

### Sources Consulted

#### 1. [Source Name]
- **URL:** [link]
- **Searched For:** [specific query or topic]
- **What I Found:** [content that was there]
- **Helpfulness:** ⭐⭐⭐☆☆ (3/5)
- **What Was Missing:** [critical information not present]

[Repeat for each source...]

### What Would Have Helped Me

**Missing Examples:**
1. [Specific example that should exist]
   - Use case: [when you'd need this]
   - Would have saved: [time estimate]

2. [Another missing example]

**Unclear Sections:**
- [Doc section reference] - [Why it's unclear / what's ambiguous]
- [Another section] - [Specific improvement needed]

**Type Definition Issues:**
- `TypeName` - [What's confusing about it]
- Import path: [If there were import issues]

---

## Root Cause Analysis

### The Core Issue

[What was actually wrong - be very specific]

### Why This Was Confusing

**For an AI Agent:**
- [What about my training data led me astray]
- [What patterns from other frameworks don't apply here]
- [What assumptions were incorrect]

**For Human Developers:**
- [How this would confuse humans too]
- [Why this isn't discoverable]
- [What prior knowledge is assumed]

### Broader Patterns

**Is this an isolated issue or part of a pattern?**
- [Similar issues in related areas]
- [Consistent gaps in certain types of docs]
- [API design patterns that create confusion]

---

## Impact Assessment

**Time Lost:** 
- Discovery phase: ~[X] minutes
- Trial and error: ~[X] minutes  
- Documentation searching: ~[X] minutes
- **Total:** ~[X] minutes

**Likelihood Others Hit This:**
- **Probability:** [High / Medium / Low]
- **Reasoning:** [Why this is/isn't a common scenario]

**User Experience Impact:**
- [How did this affect development flow]
- [Level of frustration: 1-10]
- [Would this make someone give up?]

**Severity Justification:**
- **Critical** = Blocked completely, no workaround found
- **High** = Significant time lost (>30 min), non-obvious solution
- **Medium** = Moderate confusion, found workaround in <30 min
- **Low** = Minor delay, solution was reasonable once found

---

## Recommendations for Cloudflare

### 1. Documentation Updates

#### [Specific Doc Page/Section]

**Current State:**
[Quote problematic section or note it's missing]

**Suggested Addition/Improvement:**
\```markdown
[Draft the improved documentation]
\```

**Rationale:**
[Why this specific change helps]

**Priority:** [High / Medium / Low]

---

### 2. Type Definition Improvements

**Problem:**
[Describe the type issue]

**Current Definition:**
\```typescript
// Problematic type definition
\```

**Suggested Improvement:**
\```typescript
// Improved type definition with better inference/clarity
\```

**Benefits:**
- [Benefit 1: e.g., "Better IDE autocomplete"]
- [Benefit 2: e.g., "Clearer error messages"]
- [Benefit 3: e.g., "Prevents common mistakes"]

---

### 3. Example Additions

#### Example: [Title]

**Use Case:** [When/why you'd need this]

**Complete Working Example:**
\```typescript
// Full working code showing the correct pattern
\```

**Key Concepts Demonstrated:**
- [Concept 1]
- [Concept 2]

**Where to Add:** [Specific doc page/section]

---

### 4. API Design Feedback

[If the API design itself made things harder]

**Current API:**
\```typescript
// Current approach
\```

**Pain Points:**
- [What's awkward or unclear]
- [What common tasks are difficult]

**Possible Improvements:**
[Constructive suggestions - only if truly valuable]

**Trade-offs:**
[Acknowledge any breaking changes or complexity]

---

## Supporting Evidence

### Files Involved
- [`worker/agents/hub.ts:23`](relative/path) - [Why this is relevant]
- [`worker-configuration.d.ts:14`](relative/path) - [Why this is relevant]

### Error Messages
\```
[Full verbatim error messages that occurred]
\```

### Build Output
\```
[Relevant compiler/build output]
\```

### Screenshots
[If applicable - drag and drop images]

---

## Environment Information

**Session Context:**
- Working directory: `/Users/craig/Code/demos/open-ralph-box`
- Node version: [version]
- npm version: [version]

**Package Versions:**
- `agents`: [version]
- `hono-agents`: [version]
- `wrangler`: [version]
- TypeScript: [version]

**Build Tools:**
- Vite: [version]
- Compiler: [tsc / esbuild / etc.]

**Related Configuration:**
- `tsconfig.json` structure
- `vite.config.ts` settings
- Relevant wrangler.toml

---

## Related Issues & Prior Art

**Similar GitHub Issues:**
- [Issue #X] - [How it relates]
- [Discussion #Y] - [How it relates]

**Similar Patterns in Other Tools:**
- [How other frameworks handle this]
- [What we could learn from them]

---

## Meta: About This Report

**Report Type:** [Initial Discovery / Follow-up / Pattern Recognition]

**Confidence Level:** [How sure am I about my recommendations]
- Recommendations: [High / Medium / Low]
- Root cause: [High / Medium / Low]
- Impact estimate: [High / Medium / Low]

**Follow-Up Needed:**
- [ ] Review with user
- [ ] Test proposed solutions
- [ ] Create GitHub issue
- [ ] Submit PR with doc fixes
- [ ] Share with Cloudflare team

---

**Report ID:** `cf-agent-advocate-[YYYYMMDD]-[counter]`
**OpenCode Version:** [version]
**Skill Version:** 1.0.0
```

### Step 8: Save and Communicate

**Save the report:**
```bash
# Save to product-feedback/YYYY-MM-DD-brief-description.md
```

**Inform the user:**
```
✅ Cloudflare Agents SDK feedback report created!

📄 Saved to: product-feedback/[filename].md

📋 Summary: [One-line summary]

🎯 Key Recommendations:
- [Top recommendation 1]
- [Top recommendation 2]

Would you like me to:
1. Create a GitHub issue from this report?
2. Share this with the Cloudflare team?
3. Save this for later review?
```

## Nudging Guidance

After resolving Cloudflare-related issues, I should nudge the user if:

1. **Significant confusion occurred** (3+ attempts to solve)
2. **Documentation was missing or wrong**
3. **Solution wasn't documented anywhere**
4. **Time lost was substantial** (>20 minutes)
5. **Others likely to hit this** (common use case)

**Nudge format:**
```
💡 I encountered some interesting confusion with the Cloudflare Agents SDK 
while working through this (took [N] attempts and ~[X] minutes to resolve). 

Would you like me to document this using `/cloudflare-agent-advocate` so the 
Cloudflare Workers team can improve the developer experience?

[Brief 1-sentence summary of what was confusing]
```

**When NOT to nudge:**
- Issue was my fault (misread docs)
- Solution was straightforward once found
- Already well-documented
- User seems in a hurry

## Example: The Env Type Confusion

See `product-feedback/2026-01-11-agents-sdk-env-types.md` for a complete example of this skill in action, documenting the TypeScript `Env` type resolution challenge.

## Tips for Effective Advocacy

**Be Specific:**
- Vague feedback like "types are confusing" isn't actionable
- Point to exact lines, specific type definitions, specific doc pages

**Show Your Work:**
- Include code for both failed and successful attempts
- Quote exact error messages
- Link to specific documentation

**Be Constructive:**
- Frame as helping improve DX, not complaining
- Propose solutions, don't just identify problems
- Acknowledge trade-offs and complexity

**Capture the AI Perspective:**
- What I assumed based on training data
- How my reasoning differed from human reasoning
- What patterns from other frameworks I tried to apply

**Think About Others:**
- Would a human developer hit this too?
- Is this a common use case?
- How much impact would fixing this have?

## Success Criteria

A good feedback report includes:

✅ Clear chronological journey through the confusion
✅ Specific documentation sources consulted
✅ Code examples of failed and successful attempts
✅ Concrete, actionable recommendations
✅ Impact assessment (time, likelihood, severity)
✅ AI agent's reasoning and assumptions
✅ Root cause analysis

## Maintenance

Update this skill when:
- New patterns of confusion emerge
- Cloudflare releases major SDK updates
- Better templates are discovered
- User feedback suggests improvements

---

**Version:** 1.0.0  
**Created:** 2026-01-11  
**Author:** Craig (Cloudflare) & OpenCode AI  
**License:** MIT
