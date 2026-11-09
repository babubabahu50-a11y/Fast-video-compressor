const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const TMP = path.join(os.tmpdir(), "video-compressor");
fs.mkdirSync(TMP, { recursive: true });

const upload = multer({
  dest: TMP,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB; adjust for your hosting plan
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Please select a video file."));
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/compress", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Video file missing." });

  const input = req.file.path;
  const output = path.join(TMP, `${Date.now()}-compressed.mp4`);

  // CPU-friendly server-side encoding. Resolution and frame rate are not changed.
  // CRF 20 balances quality and file size; preset veryfast favors speed.
  const args = [
    "-hide_banner", "-y", "-i", input,
    "-map", "0:v:0", "-map", "0:a?",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
    "-fps_mode", "passthrough",
    "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart",
    output
  ];

  const ff = spawn("ffmpeg", args);
  let stderr = "";
  ff.stderr.on("data", chunk => { stderr += chunk.toString(); });

  ff.on("error", err => {
    cleanup(input, output);
    res.status(500).json({ error: "FFmpeg could not start. Check server installation." });
  });

  ff.on("close", code => {
    fs.unlink(input, () => {});
    if (code !== 0) {
      fs.unlink(output, () => {});
      return res.status(500).json({ error: "Compression failed.", details: stderr.slice(-1200) });
    }
    res.download(output, "compressed-video.mp4", () => {
      fs.unlink(output, () => {});
    });
  });
});

function cleanup(input, output) {
  fs.unlink(input, () => {});
  fs.unlink(output, () => {});
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ error: "File is larger than the 1 GB upload limit." });
  res.status(400).json({ error: err.message || "Request error." });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Video compressor running on ${PORT}`));
