const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const certificatesDir = path.join(__dirname, "certificates");

// Ensure the directory exists
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

const generateCertificate = async (userName, event) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${userName}_${event.name}_certificate.pdf`;
      const pdfPath = path.join(certificatesDir, fileName);
      
      console.log('Generating PDF at path:', pdfPath);

      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      const doc = new PDFDocument({ size: "A4", layout: "landscape" }); // Landscape mode
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
  
      // **Background**
      doc.rect(0, 0, pageWidth, pageHeight).fill("#F8F9FA");
  
      // **Top Banner**
      doc.rect(0, 0, pageWidth, 80).fill("#1A72C9");
  
      // **Bottom Banner**
      doc.rect(0, pageHeight - 80, pageWidth, 80).fill("#E74C3C");
  
      // **Add Border**
      doc.strokeColor("#333").lineWidth(4).rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();
  
      // **Add Logo**
      const logoPath = path.join(__dirname, "assets", "Logo.png");
      if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 40, 30, { width: 120 });
      }
  
      // **Title**
      doc.fillColor("#2C3E50").font("Helvetica-Bold").fontSize(36)
          .text("Certificate of Completion", pageWidth / 2 - 180, 120, { align: "center" });
  
      doc.moveDown(2);
  
      // **User Name**
      doc.font("Helvetica").fontSize(22).fillColor("#34495E")
          .text("This is to certify that", { align: "center" });
  
      doc.font("Helvetica-Bold").fontSize(30).fillColor("#E74C3C")
          .text(`${userName}`, { align: "center" });
  
      doc.moveDown();
  
      // **Event Name**
      doc.font("Helvetica").fontSize(22).fillColor("#34495E")
          .text("has successfully completed the event", { align: "center" });
  
      doc.font("Helvetica-Bold").fontSize(26).fillColor("#3498DB")
          .text(`${event.name}`, { align: "center" });
  
      // **Event Date**
      doc.font("Helvetica").fontSize(20).fillColor("#2C3E50")
          .text(`Date: ${new Date(event.date).toDateString()}`, { align: "center" });
  
      doc.moveDown(3);
  
      // **Footer Message**
      doc.fontSize(18).fillColor("#27AE60")
          .text("Congratulations on your achievement!", { align: "center" });
  
      // **Signature**
      const signaturePath = path.join(__dirname, "assets", "Signature.png"); // Replace with actual path
      if (fs.existsSync(signaturePath)) {
          doc.image(signaturePath, pageWidth - 220, pageHeight - 130, { width: 150 });
      }
  
      // **Signature Text**
      doc.font("Helvetica-Bold").fontSize(16).fillColor("#000")
          .text("Authorized Signature", pageWidth - 200, pageHeight - 70, { align: "center" });
  
      doc.end();

      stream.on("finish", () => {
          resolve(pdfPath);
        });

      stream.on("error", (error) => {
        console.error('Stream error:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Certificate generation error:', error);
      reject(error);
    }
  });
};

module.exports = generateCertificate;
  