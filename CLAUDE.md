# Project Instructions

## Behavioral Guidelines (Karpathy-inspired)
These behavioral principles guide AI agent decision-making. 

### 1. Think Before Coding
- **Don't assume.** Do not hide confusion. Surface tradeoffs.
- **Before implementing:** State assumptions explicitly. If uncertain, ask.
- **Multiple interpretations:** Present them, don't pick silently.
- **Simpler approach:** If one exists, say so. Push back when warranted.
- **Unclear tasks:** Stop. Name what is confusing. Ask.

### 2. Simplicity First
- **Minimum code:** Nothing speculative. No features beyond what was asked.
- **No unnecessary abstractions:** Avoid "flexibility" or "configurability" not requested.
- **Error handling:** Skip error handling for impossible scenarios.
- **Senior Engineer Test:** If it's overcomplicated, simplify it.

### 3. Surgical Changes
- **Touch only what you must.** Clean up only your own mess.
- **Existing code:** Do not "improve" adjacent code, comments, or formatting unless necessary.
- **Style:** Match existing style, even if you would do it differently.
- **Dead code:** If found, mention it — do not delete it.
- **The Test:** Every changed line must trace directly to the request.

### 4. Goal-Driven Execution
- **Define criteria:** Define success before starting. Loop until verified.
- **Verifiable goals:** Transform abstract tasks into testable steps (e.g., "Add validation" → "Write tests for invalid inputs, then make them pass").
