async function convertToPDF() {
  const upload = document.getElementById('upload');
  const status = document.getElementById('status');

  if (!upload.files[0]) {
    status.textContent = 'Please select a .docx file.';
    return;
  }

  status.textContent = 'Converting...';

  const reader = new FileReader();
  reader.onload = async function(event) {
    const arrayBuffer = event.target.result;

    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
      .then(async function(result) {
        const html = result.value;

        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const text = html.replace(/<[^>]+>/g, ''); // Remove HTML tags

        const { width, height } = page.getSize();
        const fontSize = 12;
        const textLines = text.match(/.{1,80}/g); // Split into lines

        let y = height - 40;

        textLines.forEach(line => {
          page.drawText(line, {
            x: 40,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
          y -= fontSize + 4;
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.pdf';
        a.click();

        status.textContent = 'Conversion complete!';
      })
      .catch(err => {
        status.textContent = 'Error converting file.';
        console.error(err);
      });
  };

  reader.readAsArrayBuffer(upload.files[0]);
}
