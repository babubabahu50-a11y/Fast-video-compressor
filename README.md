# Fast Video Compressor

A starter website using **native server-side FFmpeg** (not FFmpeg.wasm single-thread).

## Run locally
1. Install Node.js 20+ and FFmpeg.
2. In this folder run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

## Deploy
Push this folder to a GitHub repository, then create a new Web Service on Render and connect the repository. Render will use the included `Dockerfile`.

## Important notes
- This is a working starter project, not a deployed public website.
- Processing time depends on video duration, resolution, bitrate, server CPU, and concurrent users. A 10–30 second video may finish quickly, but 10–30 seconds cannot be guaranteed. Long videos may take longer than their playback duration.
- The encoder keeps the input frame rate and does not set a new resolution. It re-encodes video as H.264 using CRF 20 and the `veryfast` preset.
- Re-encoding can change file size. Exact same size and guaranteed lower size cannot both be promised.
- This starter does not log in to TikTok or upload to social accounts. Download the compressed file and upload it yourself.
- Hosting providers enforce upload, memory, CPU, storage, and execution limits. Increase or adjust limits only after checking the hosting plan.
- For production use, add authentication/rate limits, upload quotas, cleanup jobs, and a job queue before accepting public traffic.
