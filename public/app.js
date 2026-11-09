const input = document.getElementById("video");
const fileName = document.getElementById("fileName");
const details = document.getElementById("details");
const button = document.getElementById("compress");
const status = document.getElementById("status");
const download = document.getElementById("download");

let selectedFile = null;
let resultUrl = null;

input.addEventListener("change", () => {
  selectedFile = input.files[0] || null;
  download.hidden = true;

  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null;

  button.disabled = !selectedFile;

  if (!selectedFile) return;

  fileName.textContent = selectedFile.name;
  details.hidden = false;
  details.textContent =
    `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;

  status.textContent = "কমপ্রেস করার জন্য প্রস্তুত।";
});

button.addEventListener("click", async () => {
  if (!selectedFile) return;

  button.disabled = true;
  download.hidden = true;
  status.textContent = "ভিডিও কমপ্রেস হচ্ছে...";

  const data = new FormData();
  data.append("video", selectedFile);

  try {
    const response = await fetch("/api/compress", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Compression failed");
    }

    const blob = await response.blob();
    resultUrl = URL.createObjectURL(blob);

    download.href = resultUrl;
    download.download = "compressed-video.mp4";
    download.hidden = false;

    status.textContent =
      `সম্পন্ন! Output: ${(blob.size / 1024 / 1024).toFixed(2)} MB`;
  } catch (error) {
    status.textContent = "সমস্যা: " + error.message;
  } finally {
    button.disabled = false;
  }
});
