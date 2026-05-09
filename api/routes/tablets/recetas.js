const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});
const storage = new Storage();

// POST: subida multipart (campo "file") -> GCS
// (reemplaza public/tablets/recetas/index.php)
router.post("/", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ ok: false, error: "MISSING_FILE", message: "no file uploaded" });
  }

  const bucketName = process.env.RECETAS_BUCKET;
  if (!bucketName) {
    console.error("RECETAS_BUCKET env var is not set");
    return res
      .status(500)
      .json({ ok: false, error: "CONFIG_ERROR", message: "bucket not configured" });
  }

  const objectPath = "recetas/" + req.file.originalname;

  try {
    const file = storage.bucket(bucketName).file(objectPath);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype || "application/octet-stream",
      },
      resumable: false,
    });
    await file.makePublic();

    return res.json([
      {
        url:
          "https://storage.googleapis.com/" + bucketName + "/" + objectPath,
      },
    ]);
  } catch (err) {
    console.error("recetas upload failed:", err);
    return res
      .status(500)
      .json({ ok: false, error: "UPLOAD_ERROR", message: err.message });
  }
});

module.exports = router;
