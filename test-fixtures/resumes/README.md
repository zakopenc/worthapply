# Test resume fixtures (fictional)

These files are **sample data only** — not real people or employers. Use them to test uploads, parsing, and fit analysis.

**Matching job descriptions** (for paired testing): see [`../job-descriptions/README.md`](../job-descriptions/README.md).

## Formats

| Format | Files |
|--------|--------|
| **Markdown (source)** | `senior-programmer-analyst-v*.md` — easy to edit in git |
| **Word (DOCX)** | Same base name as `.docx` — ready for upload tests |

| Variant | Markdown | DOCX |
|---------|----------|------|
| Enterprise chronological | `senior-programmer-analyst-v1-enterprise-chronological.md` | `senior-programmer-analyst-v1-enterprise-chronological.docx` |
| Analyst / government style | `senior-programmer-analyst-v2-analyst-government-style.md` | `senior-programmer-analyst-v2-analyst-government-style.docx` |
| Modern full stack (compact) | `senior-programmer-analyst-v3-modern-fullstack-compact.md` | `senior-programmer-analyst-v3-modern-fullstack-compact.docx` |

### Regenerate DOCX from Markdown (requires [Pandoc](https://pandoc.org))

From this directory:

```bash
pandoc senior-programmer-analyst-v1-enterprise-chronological.md -o senior-programmer-analyst-v1-enterprise-chronological.docx
pandoc senior-programmer-analyst-v2-analyst-government-style.md -o senior-programmer-analyst-v2-analyst-government-style.docx
pandoc senior-programmer-analyst-v3-modern-fullstack-compact.md -o senior-programmer-analyst-v3-modern-fullstack-compact.docx
```

### PDF (optional)

- **Pandoc → PDF** usually needs a LaTeX install (e.g. MiKTeX) so `pdflatex` is available.
- Or use **Chrome-based** conversion, e.g. `npx md-to-pdf <file.md>` (writes a `.pdf` next to the markdown).
