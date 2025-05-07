const multer = require('multer');
const path = require('path');

// Multer storage configuration function
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ids/');  // Save PDFs in the "uploads/ids" folder
  },
  filename: function (req, file, cb) {
    // Ensure unique file names by adding timestamp to the original name
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Optional: File filter to allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload; 
