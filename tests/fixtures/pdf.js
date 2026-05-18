// Minimal valid one-page PDF used as a placeholder upload for MOU, CV, and
// transcript. The backend only validates MIME type, but real PDF magic bytes
// keep things honest if it ever inspects content.

const PDF_BODY = `%PDF-1.1
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<<>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 24 Tf 100 700 Td (Playwright fixture) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
0000000189 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
283
%%EOF
`;

export function pdfFile(name) {
  return {
    name,
    mimeType: "application/pdf",
    buffer: Buffer.from(PDF_BODY, "utf8"),
  };
}
