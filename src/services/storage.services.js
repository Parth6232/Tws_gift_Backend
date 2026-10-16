const fs = require('fs');
const path = require('path');
const { ImageKit } = require('@imagekit/nodejs');

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// filePath = disk par image ka poora path
// folder = ImageKit ka folder, jaise '/dearkeeps/products/some-slug'
async function uploadfile(filePath, folder = '/TWS Gift/products') {
  const result = await ImageKitClient.files.upload({
    file: fs.createReadStream(filePath),
    fileName: path.basename(filePath).replace(/[^a-zA-Z0-9._-]/g, '_'),
    folder,
    useUniqueFileName: true,
  });
  return { url: result.url, publicId: result.fileId };
}

async function deletefile(fileId) {
  await ImageKitClient.files.delete(fileId);
}

module.exports = { uploadfile, deletefile };