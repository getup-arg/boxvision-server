const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

// Acepta multipart/form-data (FormData del frontend) además de
// application/x-www-form-urlencoded y application/json (que ya parsea bodyParser global).
// fieldSize alto porque image_url es un data URL base64 grande (~MB).
const parseFields = multer({
  limits: { fieldSize: 25 * 1024 * 1024 },
}).none();

function utcTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

// POST: data URL en body.image_url -> guarda como JPG en GCS
// (reemplaza public/tablets/recetas2/index.php)
router.post(
  "/",
  (req, res, next) => {
    parseFields(req, res, (err) => {
      if (err) {
        // Multer errors (e.g. LIMIT_FIELD_VALUE if image_url > 25MB) would
        // otherwise hit Express' default handler with no JSON body.
        console.error("[recetas2] multer parse failed:", {
          name: err.name,
          code: err.code,
          field: err.field,
          message: err.message,
        });
        return res.status(400).json({
          ok: false,
          error: "PARSE_ERROR",
          code: err.code || err.name,
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    const reqId = Math.random().toString(36).slice(2, 8);
    const log = (...args) => console.log(`[recetas2 ${reqId}]`, ...args);
    const logErr = (...args) => console.error(`[recetas2 ${reqId}]`, ...args);

    log("incoming POST", {
      contentType: req.headers["content-type"],
      contentLength: req.headers["content-length"],
      bodyKeys: req.body ? Object.keys(req.body) : null,
      imageUrlLen:
        req.body && typeof req.body.image_url === "string"
          ? req.body.image_url.length
          : null,
    });

    const dataUrl = req.body && req.body.image_url;
    if (!dataUrl || typeof dataUrl !== "string") {
      logErr("missing image_url; body keys were:", req.body ? Object.keys(req.body) : null);
      return res.status(400).json({
        ok: false,
        error: "MISSING_IMAGE_URL",
        message: "body.image_url is required",
        receivedContentType: req.headers["content-type"] || null,
        receivedBodyKeys: req.body ? Object.keys(req.body) : [],
      });
    }

    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) {
      logErr("data URL has no comma; first 80 chars:", dataUrl.slice(0, 80));
      return res.status(400).json({
        ok: false,
        error: "INVALID_DATA_URL",
        message: "expected 'data:<type>;base64,<payload>'",
        preview: dataUrl.slice(0, 80),
      });
    }

    // Inspect the data URL header (everything before the comma) so we know
    // what mime type the frontend actually sent.
    const header = dataUrl.slice(0, commaIdx); // e.g. "data:image/png;base64"
    const mimeMatch = header.match(/^data:([^;,]+)/);
    const mime = mimeMatch ? mimeMatch[1] : null;
    const isBase64 = /;base64$/i.test(header);
    log("data URL header parsed", { header, mime, isBase64 });

    if (!isBase64) {
      logErr("data URL is not base64-encoded; header was:", header);
      return res.status(400).json({
        ok: false,
        error: "NOT_BASE64",
        message: "data URL must be base64-encoded",
        header,
      });
    }

    const bucketName = process.env.RECETAS_BUCKET;
    if (!bucketName) {
      logErr("RECETAS_BUCKET env var is not set");
      return res.status(500).json({
        ok: false,
        error: "CONFIG_ERROR",
        message: "bucket not configured (RECETAS_BUCKET env var missing)",
      });
    }
    log("using bucket:", bucketName);

    const buffer = Buffer.from(dataUrl.slice(commaIdx + 1), "base64");
    log("decoded buffer", { bytes: buffer.length });
    if (buffer.length === 0) {
      logErr("decoded buffer is empty — base64 payload was empty or invalid");
      return res.status(400).json({
        ok: false,
        error: "EMPTY_PAYLOAD",
        message: "base64 payload decoded to 0 bytes",
      });
    }

    const ts = utcTimestamp();
    const objectPath = "recetas2/receta-" + ts + ".jpg";
    log("target object path:", objectPath);

    try {
      const file = storage.bucket(bucketName).file(objectPath);

      log("uploading to GCS...");
      await file.save(buffer, {
        metadata: { contentType: "image/jpeg" },
        resumable: false,
      });
      log("upload OK");

      log("calling makePublic()...");
      await file.makePublic();
      log("makePublic OK");

      const url =
        "https://storage.googleapis.com/" + bucketName + "/" + objectPath;
      log("done", { url });
      return res.json([{ data: dataUrl, url }]);
    } catch (err) {
      // Surface every diagnostic GCS gives us. Common causes:
      //   - 403 on makePublic with uniform bucket-level access enabled
      //   - 404 if bucket name is wrong
      //   - auth errors if the Cloud Run service account lacks Storage Object Admin
      logErr("upload/publish failed", {
        name: err.name,
        code: err.code,
        status: err.response && err.response.status,
        errors: err.errors,
        message: err.message,
        stack: err.stack,
      });
      return res.status(500).json({
        ok: false,
        error: "UPLOAD_ERROR",
        code: err.code || err.name || null,
        status: (err.response && err.response.status) || null,
        message: err.message,
        details: err.errors || null,
      });
    }
  }
);

module.exports = router;
