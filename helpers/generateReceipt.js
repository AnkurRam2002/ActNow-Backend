const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const receiptDir = path.join(__dirname, "receipts");

if (!fs.existsSync(receiptDir)) {
  fs.mkdirSync(receiptDir, { recursive: true });
}

const generateReceipt = ({ name, email, amount, paymentId, ngoName }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 }); // Added margin for a neat layout
      const fileName = `receipt-${paymentId}.pdf`;
      const filePath = path.join(receiptDir, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Logo
      const logoPath = path.join(__dirname, "assets", "Logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (doc.page.width - 120) / 2, 50, { width: 120 });
        doc.moveDown(6);
      }

      // Title and Header Section
      doc
        .fillColor("#000000")
        .fontSize(20)
        .text("NGO Donation Receipt", { align: "center" })

      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Receipt ID: ${paymentId}`, { align: "center" })
        .moveDown(2);

      // Line Separator
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Horizontal line
      doc.moveDown(1); // Add margin below the line

      // Donor Information Section
      doc
        .fontSize(16)
        .fillColor("#000000")
        .text("Donor Information", { underline: true })
        .moveDown(1)
        .fontSize(12)
        .text(`Name: ${name}`)
        .text(`Email: ${email}`)
        .moveDown(2);

      // Donation Information Section
      doc
        .fontSize(16)
        .fillColor("#000000")
        .text("Donation Details", { underline: true })
        .moveDown(1)
        .fontSize(12)
        .text(`Donated To: ${ngoName}`)
        .text(`Amount Donated: Rs. ${amount.toFixed(2)}`)
        .text(`Payment ID: ${paymentId}`)
        .text(`Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`)
        .moveDown(2);

      // Line Separator
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1); // Add margin below the line

      // Footer Section (Thank You Message)
      doc
        .fillColor("#555555")
        .fontSize(12)
        .text("Thank you for your generous donation!", { align: "center" })
        .text(
          "Your support makes a real difference in the lives of those in need.",
          { align: "center" }
        );

      doc.end();

      // After the receipt is saved, schedule its cleanup
      stream.on("finish", () => {
        // Cleanup the receipt after 2 minutes
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error cleaning up file: ${err}`);
            } else {
              console.log(`Successfully deleted: ${filePath}`);
            }
          });
        }, 120000); // 2 minutes delay

        resolve(filePath);
      });
      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateReceipt;
