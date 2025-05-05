const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const certificatesDir = path.join(__dirname, "certificates");

if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

const generateCertificate = async (userName, event) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape" });

      const fileName = `${userName}_${event.name}_certificate.pdf`;
      const pdfPath = path.join(certificatesDir, fileName);
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#F8F9FA");

      // Top and bottom banners
      //doc.rect(0, 0, pageWidth, 80).fill("#1A72C9");
     // doc.rect(0, pageHeight - 80, pageWidth, 80).fill("#E74C3C");

      // Border
      doc.strokeColor("#333").lineWidth(4).rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();

      // Logo
      const logoPath = path.join(__dirname, "assets", "Logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 120 });
      }

      // Title
      doc.fillColor("#2C3E50")
      .font("Helvetica-Bold")
      .fontSize(36)
      .text("Certificate of Completion", 0, 120, { align: "center" });

      // User Name Section
      doc.font("Helvetica")
      .fontSize(20)
      .fillColor("#34495E")
      .text("This is to certify that", 0, 180, { align: "center" });

      doc.font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#E74C3C")
      .text(`${userName}`, 0, 210, { align: "center" });

      // Event Name Section
      doc.font("Helvetica")
      .fontSize(20)
      .fillColor("#34495E")
      .text("has successfully completed the event", 0, 250, { align: "center" });

      doc.font("Helvetica-Bold")
      .fontSize(26)
      .fillColor("#3498DB")
      .text(`${event.name}`, 0, 280, { align: "center" });

      // Event Date
      doc.font("Helvetica")
      .fontSize(18)
      .fillColor("#2C3E50")
      .text(`Date: ${new Date(event.date).toDateString()}`, 0, 320, { align: "center" });

      // Footer Message
      doc.fontSize(16)
      .fillColor("#27AE60")
      .text("Congratulations on your achievement!", 0, 360, { align: "center" });

      // Signature image
      //const signaturePath = path.join(__dirname, "assets", "Signature.png");
      //if (fs.existsSync(signaturePath)) {
      //  doc.image(signaturePath, pageWidth - 220, pageHeight - 130, { width: 150 });
      //}

      // Signature text
      doc.font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#000")
        .text("Authorized Signature", 0, 420, { align: "right", width: pageWidth - 60 });

      doc.end();

      stream.on("finish", () => {
        resolve(pdfPath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateCertificate;

  