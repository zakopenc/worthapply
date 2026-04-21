import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, TabStopPosition, TabStopType, TextRun } from 'docx';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ── Professional Resume Document Model ─────────────────────────────
export interface ResumeExperienceBullet {
  text: string;
  annotation?: {
    framework?: 'PAR' | 'CAR';
    reason: string;
  };
}

export interface ResumeExperienceEntry {
  title: string;
  company: string;
  location?: string;
  dates?: string;
  bullets: string[];
  /** Optional per-bullet annotations (framework + reason) parallel to bullets[] */
  bulletAnnotations?: (ResumeExperienceBullet['annotation'] | undefined)[];
}

export interface ResumeEducationEntry {
  degree: string;
  school: string;
  dates?: string;
  details?: string;
}

export interface ResumeSkillGroup {
  category?: string;
  items: string[];
}

export interface ResumeDocumentModel {
  header: {
    name: string;
    headline?: string;
    contacts: string[];
  };
  summary?: string;
  experience: ResumeExperienceEntry[];
  skills?: ResumeSkillGroup[];
  education?: ResumeEducationEntry[];
  certifications?: string[];
  leadership?: string[];
}

export interface ExportSection {
  heading?: string;
  body?: string;
}

export interface ZipEntry {
  filename: string;
  blob: Blob;
}

const BRAND = {
  name: 'WorthApply',
  ink: rgb(0.12, 0.16, 0.24),
  body: rgb(0.22, 0.25, 0.31),
  muted: rgb(0.45, 0.49, 0.56),
  accent: rgb(0.83, 0.6, 0.51),
  accentSoft: rgb(0.96, 0.91, 0.88),
  border: rgb(0.9, 0.86, 0.83),
};

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildDownloadFilename(parts: string[], suffix: string, extension: 'txt' | 'docx' | 'pdf' | 'zip') {
  return [...parts, suffix]
    .map((part) => sanitizeFilePart(part))
    .filter(Boolean)
    .join('-') + `.${extension}`;
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function buildParagraphDocxBlob(sections: ExportSection[]) {
  const doc = new Document({
    sections: [
      {
        children: sections.flatMap((section) => {
          const children: Paragraph[] = [];
          if (section.heading) {
            children.push(
              new Paragraph({
                text: section.heading,
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 140 },
              })
            );
          }

          if (section.body) {
            children.push(
              ...section.body.split('\n').map((line) =>
                new Paragraph({
                  children: [new TextRun({ text: line })],
                  spacing: { after: 140 },
                })
              )
            );
          }

          return children;
        }),
      },
    ],
  });

  return Packer.toBlob(doc);
}

function wrapText(text: string, maxWidth: number, measure: (line: string) => number) {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach((paragraph) => {
    const content = paragraph.trim();
    if (!content) {
      lines.push('');
      return;
    }

    const words = content.split(/\s+/);
    let current = '';

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (measure(next) <= maxWidth) {
        current = next;
        return;
      }

      if (current) {
        lines.push(current);
      }
      current = word;
    });

    if (current) {
      lines.push(current);
    }
  });

  return lines;
}

export async function buildSimplePdfBlob(title: string, sections: ExportSection[]) {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [612, 792];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 54;
  const footerHeight = 24;
  const bodySize = 11;
  const headingSize = 12;
  const titleSize = 20;
  const lineHeight = 16;
  const maxWidth = pageSize[0] - margin * 2;

  let page = pdfDoc.addPage(pageSize);
  let y = 0;

  const resetCursor = () => {
    y = pageSize[1] - margin;
  };

  const addPage = () => {
    page = pdfDoc.addPage(pageSize);
    resetCursor();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < margin + footerHeight) {
      addPage();
    }
  };

  resetCursor();

  if (title) {
    page.drawText(title, {
      x: margin,
      y,
      size: titleSize,
      font: boldFont,
      color: BRAND.ink,
    });
    y -= titleSize + 8;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageSize[0] - margin, y },
      thickness: 0.75,
      color: BRAND.border,
    });
    y -= 16;
  }

  sections.forEach((section) => {
    if (section.heading) {
      ensureSpace(28);
      page.drawText(section.heading.toUpperCase(), {
        x: margin,
        y,
        size: headingSize,
        font: boldFont,
        color: BRAND.ink,
      });
      y -= 8;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageSize[0] - margin, y },
        thickness: 1,
        color: BRAND.border,
      });
      y -= 16;
    }

    if (section.body) {
      const lines = wrapText(section.body, maxWidth, (line) => font.widthOfTextAtSize(line, bodySize));
      lines.forEach((line) => {
        ensureSpace(lineHeight);
        if (line) {
          const isBullet = line.startsWith('• ');
          if (isBullet) {
            page.drawText('•', {
              x: margin,
              y,
              size: bodySize,
              font: boldFont,
              color: BRAND.accent,
            });
            page.drawText(line.slice(2), {
              x: margin + 12,
              y,
              size: bodySize,
              font,
              color: BRAND.body,
            });
          } else {
            page.drawText(line, {
              x: margin,
              y,
              size: bodySize,
              font,
              color: BRAND.body,
            });
          }
        }
        y -= lineHeight;
      });
      y -= 8;
    }
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.length);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new Blob([pdfBuffer], { type: 'application/pdf' });
}

export async function buildZipBlob(entries: ZipEntry[]) {
  const zip = new JSZip();

  await Promise.all(entries.map(async (entry) => {
    const buffer = await entry.blob.arrayBuffer();
    zip.file(entry.filename, buffer);
  }));

  return zip.generateAsync({ type: 'blob' });
}

// ── Professional resume export (no branding, single-column, ATS-safe) ──

export async function buildResumeDocxBlob(doc: ResumeDocumentModel): Promise<Blob> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: doc.header.name || 'Your Name', bold: true, size: 44 })],
    })
  );

  if (doc.header.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: doc.header.headline, size: 22, color: '444444' })],
      })
    );
  }

  if (doc.header.contacts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: doc.header.contacts.filter(Boolean).join('  •  '), size: 20, color: '555555' })],
      })
    );
  }

  const addSectionHeading = (label: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        border: { bottom: { color: '222222', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 22, color: '1a1a1a' })],
      })
    );
  };

  if (doc.summary) {
    addSectionHeading('Summary');
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: doc.summary, size: 22 })],
      })
    );
  }

  if (doc.experience.length > 0) {
    addSectionHeading('Experience');
    doc.experience.forEach((job) => {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: job.title || '', bold: true, size: 22 }),
            new TextRun({ text: job.company ? `  |  ${job.company}` : '', size: 22 }),
            ...(job.dates ? [new TextRun({ text: `\t${job.dates}`, size: 20, color: '555555' })] : []),
          ],
        })
      );

      if (job.location) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: job.location, size: 20, color: '555555', italics: true })],
          })
        );
      }

      job.bullets.forEach((bullet) => {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 220, hanging: 220 },
            children: [new TextRun({ text: `•  ${bullet}`, size: 22 })],
          })
        );
      });
    });
  }

  if (doc.skills && doc.skills.length > 0) {
    addSectionHeading('Skills');
    doc.skills.forEach((group) => {
      const prefix = group.category ? `${group.category}: ` : '';
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            ...(group.category ? [new TextRun({ text: prefix, bold: true, size: 22 })] : []),
            new TextRun({ text: group.items.join(', '), size: 22 }),
          ],
        })
      );
    });
  }

  if (doc.education && doc.education.length > 0) {
    addSectionHeading('Education');
    doc.education.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: ed.degree || '', bold: true, size: 22 }),
            new TextRun({ text: ed.school ? `  |  ${ed.school}` : '', size: 22 }),
            ...(ed.dates ? [new TextRun({ text: `\t${ed.dates}`, size: 20, color: '555555' })] : []),
          ],
        })
      );
      if (ed.details) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: ed.details, size: 20, color: '444444' })],
          })
        );
      }
    });
  }

  if (doc.certifications && doc.certifications.length > 0) {
    addSectionHeading('Certifications');
    doc.certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 220, hanging: 220 },
          children: [new TextRun({ text: `•  ${cert}`, size: 22 })],
        })
      );
    });
  }

  if (doc.leadership && doc.leadership.length > 0) {
    addSectionHeading('Leadership');
    doc.leadership.forEach((item) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 220, hanging: 220 },
          children: [new TextRun({ text: `•  ${item}`, size: 22 })],
        })
      );
    });
  }

  const document = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}

// Annotated DOCX — same professional layout, but each bullet carries an italic
// coaching note underneath explaining framework + reason. Meant for the
// candidate's own records; NEVER send this to a recruiter.
export async function buildAnnotatedResumeDocxBlob(doc: ResumeDocumentModel): Promise<Blob> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: doc.header.name || 'Your Name', bold: true, size: 44 })],
    })
  );

  if (doc.header.contacts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: doc.header.contacts.filter(Boolean).join('  •  '), size: 20, color: '555555' })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      border: { top: { color: '999999', space: 1, style: BorderStyle.SINGLE, size: 4 }, bottom: { color: '999999', space: 1, style: BorderStyle.SINGLE, size: 4 } },
      children: [new TextRun({ text: 'ANNOTATED VERSION — for your reference only. Do not send this copy to recruiters.', italics: true, size: 18, color: '777777' })],
    })
  );

  const addSectionHeading = (label: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        border: { bottom: { color: '222222', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 22, color: '1a1a1a' })],
      })
    );
  };

  if (doc.summary) {
    addSectionHeading('Summary');
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: doc.summary, size: 22 })],
      })
    );
  }

  if (doc.experience.length > 0) {
    addSectionHeading('Experience');
    doc.experience.forEach((job) => {
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: job.title || '', bold: true, size: 22 }),
            new TextRun({ text: job.company ? `  |  ${job.company}` : '', size: 22 }),
            ...(job.dates ? [new TextRun({ text: `\t${job.dates}`, size: 20, color: '555555' })] : []),
          ],
        })
      );

      job.bullets.forEach((bullet, idx) => {
        children.push(
          new Paragraph({
            spacing: { after: 20 },
            indent: { left: 220, hanging: 220 },
            children: [new TextRun({ text: `•  ${bullet}`, size: 22 })],
          })
        );
        const note = job.bulletAnnotations?.[idx];
        if (note) {
          const parts: TextRun[] = [];
          if (note.framework) {
            parts.push(new TextRun({ text: `[${note.framework}] `, italics: true, bold: true, size: 18, color: '6b21a8' }));
          }
          parts.push(new TextRun({ text: note.reason, italics: true, size: 18, color: '555555' }));
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: 460 },
              children: parts,
            })
          );
        }
      });
    });
  }

  if (doc.skills && doc.skills.length > 0) {
    addSectionHeading('Skills');
    doc.skills.forEach((group) => {
      const prefix = group.category ? `${group.category}: ` : '';
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            ...(group.category ? [new TextRun({ text: prefix, bold: true, size: 22 })] : []),
            new TextRun({ text: group.items.join(', '), size: 22 }),
          ],
        })
      );
    });
  }

  if (doc.education && doc.education.length > 0) {
    addSectionHeading('Education');
    doc.education.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: ed.degree || '', bold: true, size: 22 }),
            new TextRun({ text: ed.school ? `  |  ${ed.school}` : '', size: 22 }),
            ...(ed.dates ? [new TextRun({ text: `\t${ed.dates}`, size: 20, color: '555555' })] : []),
          ],
        })
      );
    });
  }

  const document = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
    },
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}

export async function buildResumePdfBlob(doc: ResumeDocumentModel): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [612, 792];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const margin = 54;
  const contentWidth = pageSize[0] - margin * 2;
  const nameSize = 22;
  const headlineSize = 11;
  const contactSize = 10;
  const sectionSize = 11;
  const bodySize = 10.5;
  const jobHeaderSize = 11;
  const line = 1.35;

  const ink = rgb(0.09, 0.1, 0.12);
  const body = rgb(0.2, 0.22, 0.26);
  const muted = rgb(0.38, 0.42, 0.48);
  const rule = rgb(0.7, 0.73, 0.78);

  let page = pdfDoc.addPage(pageSize);
  let y = pageSize[1] - margin;

  const wrap = (text: string, size: number, useFont = font) => {
    const lines: string[] = [];
    const paragraphs = text.split('\n');
    paragraphs.forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      let current = '';
      for (const w of words) {
        const candidate = current ? `${current} ${w}` : w;
        if (useFont.widthOfTextAtSize(candidate, size) <= contentWidth) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = w;
        }
      }
      if (current) lines.push(current);
      if (words.length === 0) lines.push('');
    });
    return lines;
  };

  const needSpace = (pts: number) => {
    if (y - pts < margin) {
      page = pdfDoc.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  };

  const drawParagraph = (text: string, opts: { size: number; useFont?: typeof font; color?: ReturnType<typeof rgb>; x?: number; indent?: number }) => {
    const effectiveWidth = contentWidth - (opts.indent || 0);
    const f = opts.useFont ?? font;
    const lines: string[] = [];
    text.split('\n').forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      let current = '';
      for (const w of words) {
        const candidate = current ? `${current} ${w}` : w;
        if (f.widthOfTextAtSize(candidate, opts.size) <= effectiveWidth) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = w;
        }
      }
      if (current) lines.push(current);
      if (words.length === 0) lines.push('');
    });
    lines.forEach((ln) => {
      needSpace(opts.size * line);
      page.drawText(ln, {
        x: (opts.x ?? margin) + (opts.indent || 0),
        y,
        size: opts.size,
        font: f,
        color: opts.color ?? body,
      });
      y -= opts.size * line;
    });
  };

  const drawSectionHeading = (label: string) => {
    needSpace(sectionSize * line + 10);
    y -= 6;
    page.drawText(label.toUpperCase(), {
      x: margin,
      y,
      size: sectionSize,
      font: bold,
      color: ink,
    });
    y -= sectionSize * line;
    page.drawLine({
      start: { x: margin, y: y + 4 },
      end: { x: pageSize[0] - margin, y: y + 4 },
      thickness: 0.75,
      color: rule,
    });
    y -= 4;
  };

  // Header
  const nameText = doc.header.name || 'Your Name';
  const nameWidth = bold.widthOfTextAtSize(nameText, nameSize);
  needSpace(nameSize * 1.5);
  page.drawText(nameText, {
    x: (pageSize[0] - nameWidth) / 2,
    y,
    size: nameSize,
    font: bold,
    color: ink,
  });
  y -= nameSize * 1.15;

  if (doc.header.headline) {
    const w = italic.widthOfTextAtSize(doc.header.headline, headlineSize);
    needSpace(headlineSize * line);
    page.drawText(doc.header.headline, {
      x: (pageSize[0] - w) / 2,
      y,
      size: headlineSize,
      font: italic,
      color: muted,
    });
    y -= headlineSize * line;
  }

  const contactLine = doc.header.contacts.filter(Boolean).join('  •  ');
  if (contactLine) {
    const w = font.widthOfTextAtSize(contactLine, contactSize);
    needSpace(contactSize * line);
    page.drawText(contactLine, {
      x: (pageSize[0] - w) / 2,
      y,
      size: contactSize,
      font,
      color: muted,
    });
    y -= contactSize * line;
  }
  y -= 6;

  // Summary
  if (doc.summary) {
    drawSectionHeading('Summary');
    drawParagraph(doc.summary, { size: bodySize });
    y -= 4;
  }

  // Experience
  if (doc.experience.length > 0) {
    drawSectionHeading('Experience');
    doc.experience.forEach((job) => {
      needSpace(jobHeaderSize * line + 4);
      const headerLeft = [job.title, job.company].filter(Boolean).join('  |  ');
      page.drawText(headerLeft, { x: margin, y, size: jobHeaderSize, font: bold, color: ink });
      if (job.dates) {
        const w = font.widthOfTextAtSize(job.dates, contactSize);
        page.drawText(job.dates, { x: pageSize[0] - margin - w, y, size: contactSize, font, color: muted });
      }
      y -= jobHeaderSize * line;

      if (job.location) {
        needSpace(contactSize * line);
        page.drawText(job.location, { x: margin, y, size: contactSize, font: italic, color: muted });
        y -= contactSize * line;
      }

      job.bullets.forEach((bullet) => {
        needSpace(bodySize * line);
        page.drawText('•', { x: margin + 2, y, size: bodySize, font: bold, color: ink });
        const lines = wrap(bullet, bodySize);
        lines.forEach((ln, i) => {
          needSpace(bodySize * line);
          page.drawText(ln, { x: margin + 14, y, size: bodySize, font, color: body });
          y -= bodySize * line;
          if (i === 0 && lines.length > 1) {
            // continuation is handled by wrap; we already advanced y
          }
        });
      });

      y -= 4;
    });
  }

  // Skills
  if (doc.skills && doc.skills.length > 0) {
    drawSectionHeading('Skills');
    doc.skills.forEach((group) => {
      if (group.category) {
        needSpace(bodySize * line);
        page.drawText(`${group.category}: `, { x: margin, y, size: bodySize, font: bold, color: ink });
        const prefixW = bold.widthOfTextAtSize(`${group.category}: `, bodySize);
        const items = group.items.join(', ');
        const firstFit = contentWidth - prefixW;
        const words = items.split(/,\s*/);
        let line1 = '';
        const rest: string[] = [];
        for (const w of words) {
          const cand = line1 ? `${line1}, ${w}` : w;
          if (font.widthOfTextAtSize(cand, bodySize) <= firstFit) line1 = cand;
          else rest.push(w);
        }
        page.drawText(line1, { x: margin + prefixW, y, size: bodySize, font, color: body });
        y -= bodySize * line;
        if (rest.length) {
          drawParagraph(rest.join(', '), { size: bodySize });
        }
      } else {
        drawParagraph(group.items.join(', '), { size: bodySize });
      }
    });
    y -= 4;
  }

  // Education
  if (doc.education && doc.education.length > 0) {
    drawSectionHeading('Education');
    doc.education.forEach((ed) => {
      needSpace(jobHeaderSize * line);
      const left = [ed.degree, ed.school].filter(Boolean).join('  |  ');
      page.drawText(left, { x: margin, y, size: jobHeaderSize, font: bold, color: ink });
      if (ed.dates) {
        const w = font.widthOfTextAtSize(ed.dates, contactSize);
        page.drawText(ed.dates, { x: pageSize[0] - margin - w, y, size: contactSize, font, color: muted });
      }
      y -= jobHeaderSize * line;
      if (ed.details) {
        drawParagraph(ed.details, { size: contactSize, color: muted });
      }
      y -= 2;
    });
  }

  // Certifications
  if (doc.certifications && doc.certifications.length > 0) {
    drawSectionHeading('Certifications');
    doc.certifications.forEach((c) => {
      needSpace(bodySize * line);
      page.drawText('•', { x: margin + 2, y, size: bodySize, font: bold, color: ink });
      drawParagraph(c, { size: bodySize, indent: 14 });
    });
  }

  // Leadership
  if (doc.leadership && doc.leadership.length > 0) {
    drawSectionHeading('Leadership');
    doc.leadership.forEach((c) => {
      needSpace(bodySize * line);
      page.drawText('•', { x: margin + 2, y, size: bodySize, font: bold, color: ink });
      drawParagraph(c, { size: bodySize, indent: 14 });
    });
  }

  const bytes = await pdfDoc.save();
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: 'application/pdf' });
}
