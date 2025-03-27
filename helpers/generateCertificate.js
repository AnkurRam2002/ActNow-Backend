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
      const doc = new PDFDocument();
      const fileName = `${userName}_${event.name}_certificate.pdf`;
      const pdfPath = path.join(certificatesDir, fileName);
      
      console.log('Generating PDF at path:', pdfPath);

      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      doc.fontSize(22).text("Certificate of Completion", { align: "center" });
      doc.moveDown();
      doc.fontSize(16).text(`This is to certify that ${userName}`, { align: "center" });
      doc.moveDown();
      doc.text(`has successfully completed the event`, { align: "center" });
      doc.moveDown();

      // Only display the single event name
      doc.fontSize(18).text(`${event.name} - ${new Date(event.date).toDateString()}`, { align: "center" });

      doc.moveDown(2);
      doc.text("Congratulations!", { align: "center", fontSize: 18 });

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
  