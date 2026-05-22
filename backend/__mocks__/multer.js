const multer = jest.fn(() => ({
  single: jest.fn(() => (req, res, next) => {
    // Simulate successful file upload
    req.file = {
      filename: `${Date.now()}-test.pdf`,
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 12345,
      path: 'uploads/test.pdf',
    };
    next();
  }),
}));

multer.diskStorage = jest.fn(() => ({}));

module.exports = multer;