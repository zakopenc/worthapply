import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface ExportSection {
  heading?: string;
  body?: string;
}

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildDownloadFilename(parts: string[], suffix: string, extension: 'txt' | 'docx' | 'pdf') {
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
  let page = pdfDoc.addPage(pageSize);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 54;
  const bodySize = 11;
  const headingSize = 14;
  const titleSize = 18;
  const lineHeight = 16;
  const maxWidth = pageSize[0] - margin * 2;
  let y = pageSize[1] - margin;

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < margin) {
      page = pdfDoc.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  };

  ensureSpace(titleSize + 12);
  page.drawText(title, {
    x: margin,
    y,
    size: titleSize,
    font: boldFont,
    color: rgb(0.07, 0.1, 0.16),
  });
  y -= titleSize + 16;

  sections.forEach((section) => {
    if (section.heading) {
      ensureSpace(headingSize + 10);
      page.drawText(section.heading, {
        x: margin,
        y,
        size: headingSize,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.24),
      });
      y -= headingSize + 8;
    }

    if (section.body) {
      const lines = wrapText(section.body, maxWidth, (line) => font.widthOfTextAtSize(line, bodySize));
      lines.forEach((line) => {
        ensureSpace(lineHeight);
        if (line) {
          page.drawText(line, {
            x: margin,
            y,
            size: bodySize,
            font,
            color: rgb(0.18, 0.2, 0.25),
          });
        }
        y -= lineHeight;
      });
      y -= 6;
    }
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.length);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new Blob([pdfBuffer], { type: 'application/pdf' });
}
