import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

function formatExportDate() {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export async function buildSimplePdfBlob(title: string, sections: ExportSection[]) {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [612, 792];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 54;
  const headerHeight = 60;
  const footerHeight = 38;
  const bodySize = 11;
  const headingSize = 12;
  const titleSize = 22;
  const lineHeight = 16;
  const maxWidth = pageSize[0] - margin * 2;
  const exportedAt = formatExportDate();

  let page = pdfDoc.addPage(pageSize);
  let pageNumber = 1;
  let y = 0;

  const resetCursor = () => {
    y = pageSize[1] - margin - headerHeight;
  };

  const drawFrame = () => {
    page.drawRectangle({
      x: margin,
      y: pageSize[1] - margin - 18,
      width: maxWidth,
      height: 2,
      color: BRAND.accent,
    });

    page.drawText(BRAND.name, {
      x: margin,
      y: pageSize[1] - margin + 6,
      size: 10,
      font: boldFont,
      color: BRAND.ink,
    });

    page.drawText('Tailored application export', {
      x: margin,
      y: pageSize[1] - margin - 10,
      size: 9,
      font,
      color: BRAND.muted,
    });

    const footerY = margin - 10;
    page.drawLine({
      start: { x: margin, y: footerY + 16 },
      end: { x: pageSize[0] - margin, y: footerY + 16 },
      thickness: 1,
      color: BRAND.border,
    });

    page.drawText(`Generated ${exportedAt}`, {
      x: margin,
      y: footerY,
      size: 9,
      font,
      color: BRAND.muted,
    });

    page.drawText(`Page ${pageNumber}`, {
      x: pageSize[0] - margin - 34,
      y: footerY,
      size: 9,
      font,
      color: BRAND.muted,
    });
  };

  const addPage = () => {
    page = pdfDoc.addPage(pageSize);
    pageNumber += 1;
    drawFrame();
    resetCursor();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < margin + footerHeight) {
      addPage();
    }
  };

  drawFrame();
  resetCursor();

  page.drawText(title, {
    x: margin,
    y,
    size: titleSize,
    font: boldFont,
    color: BRAND.ink,
  });
  y -= titleSize + 10;

  page.drawRectangle({
    x: margin,
    y: y - 6,
    width: maxWidth,
    height: 28,
    color: BRAND.accentSoft,
    borderColor: BRAND.border,
    borderWidth: 1,
  });
  page.drawText('Export prepared for quick review and clean sharing.', {
    x: margin + 12,
    y,
    size: 10,
    font,
    color: BRAND.body,
  });
  y -= 34;

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
