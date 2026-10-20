const fs = require('fs');
const path = require('path');
const { ImageKit, toFile } = require('@imagekit/nodejs');

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const cleanName = (name) => String(name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');

// input 2 tarah ka ho sakta hai:
//  1) string  -> disk par image ka path (seedImages.js isi tarah use karta hai)
//  2) object  -> multer memoryStorage ki file ({ buffer, originalname, mimetype }) (admin panel se upload)
// folder = ImageKit ka folder, jaise '/dearkeeps/products/some-slug'
async function uploadfile(input, folder = '/TWS Gift/products') {
  let file;
  let fileName;

  if (typeof input === 'string') {
    file = fs.createReadStream(input);
    fileName = cleanName(path.basename(input));
  } else if (input && Buffer.isBuffer(input.buffer)) {
    fileName = cleanName(input.originalname);
    file = await toFile(input.buffer, fileName, { type: input.mimetype });
  } else if (input && typeof input.path === 'string') {
    // multer diskStorage ke liye (agar kabhi storage badle)
    file = fs.createReadStream(input.path);
    fileName = cleanName(input.originalname || path.basename(input.path));
  } else {
    throw new Error('uploadfile: invalid file (path string ya multer file chahiye)');
  }

  const result = await ImageKitClient.files.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
  });
  return { url: result.url, publicId: result.fileId };
}

async function deletefile(fileId) {
  await ImageKitClient.files.delete(fileId);
}

module.exports = { uploadfile, deletefile };