const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module

const UPLOADS_DIR = 'uploads/';

// Ensure uploads directory exists
// This will run once when the module is loaded
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created directory: ${UPLOADS_DIR}`);
  } catch (err) {
    console.error(`Error creating directory ${UPLOADS_DIR}:`, err);
    // Depending on the application's needs, you might want to throw the error
    // or handle it in a way that doesn't prevent the app from starting if uploads are critical.
  }
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR); // Use the defined constant
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Middleware for single profile image and single ID proof
const uploadCoolieFiles = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'idProofImage', maxCount: 1 }
]);

module.exports = { uploadCoolieFiles, upload };
