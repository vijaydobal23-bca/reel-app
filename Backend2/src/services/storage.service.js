const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "../../upload");

function getSafeExtension(mimeType = "") {
    if (mimeType === "video/mp4") return ".mp4";
    if (mimeType === "video/webm") return ".webm";
    if (mimeType === "video/quicktime") return ".mov";
    return ".bin";
}

async function ensureUploadDirectory() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function uploadFile(fileBuffer, mimeType) {
    await ensureUploadDirectory();

    const ext = getSafeExtension(mimeType);
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const destination = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(destination, fileBuffer);

    return {
        url: `/upload/${fileName}`
    };
}

module.exports = {
    uploadFile
};
