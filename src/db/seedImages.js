require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ====== YE 3 PATH/NAAM APNE PROJECT KE HISAAB SE CHECK KARO ======
const Product = require('../models/product.model.js');          // 1. Product model ka path
const { uploadfile } = require('../services/storage.services.js');     // 2. ImageKit helper ka path
const MONGO_URI = process.env.MONGO_URI;                 // 3. .env mein DB variable ka naam
// =================================================================

const IMAGES_DIR = path.join(__dirname, '../../product-images');
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force'); // jin products mein images hain unhe bhi dobara upload

// Folder ke andar sirf images lo (video skip). Bina extension waali file ko png maan lo.
function getImageFiles(dir) {
    return fs
        .readdirSync(dir)
        .filter((f) => {
            if (!fs.statSync(path.join(dir, f)).isFile()) return false;
            const ext = path.extname(f).toLowerCase();
            return ext === '' || IMAGE_EXTS.includes(ext);
        })
        .sort((a, b) => {
            // size chart sabse last mein
            const sa = /size ?chart/i.test(a) ? 1 : 0;
            const sb = /size ?chart/i.test(b) ? 1 : 0;
            if (sa !== sb) return sa - sb;
            return a.localeCompare(b, undefined, { numeric: true });
        });
}

const norm = (s) => s.trim().toLowerCase();

(async () => {
    await mongoose.connect(MONGO_URI);
    console.log('DB connected');

    const products = await Product.find({});
    const folders = fs
        .readdirSync(IMAGES_DIR)
        .filter((f) => fs.statSync(path.join(IMAGES_DIR, f)).isDirectory());

    // title -> product
    const byTitle = new Map(products.map((p) => [norm(p.title), p]));

    const matched = [];
    const unmatchedFolders = [];
    for (const folder of folders) {
        const product = byTitle.get(norm(folder));
        if (product) matched.push({ folder, product });
        else unmatchedFolders.push(folder);
    }

    const matchedIds = new Set(matched.map((m) => String(m.product._id)));
    const noImages = products.filter((p) => !matchedIds.has(String(p._id)));

    console.log(
        `\nFolders mile: ${folders.length} | Match hue: ${matched.length} | Match nahi hue: ${unmatchedFolders.length}`
    );
    if (unmatchedFolders.length) {
        console.log('\nIn folders ka product nahi mila:');
        unmatchedFolders.forEach((f) => console.log('  -', f));
    }
    if (noImages.length) {
        console.log(`\nIn ${noImages.length} products ke folder nahi hain:`);
        noImages.forEach((p) => console.log('  -', p.title));
    }

    if (DRY) {
        console.log('\nDRY RUN: kuch upload nahi hoga. Match hue products:');
        matched.forEach(({ folder, product }) => {
            const n = getImageFiles(path.join(IMAGES_DIR, folder)).length;
            console.log(`  ${product.title}  <-  ${n} image(s)`);
        });
        await mongoose.disconnect();
        return;
    }

    let updated = 0, uploaded = 0, skipped = 0, failed = 0;

    for (const { folder, product } of matched) {
        try {
            if (!FORCE && product.images && product.images.length > 0) {
                skipped++;
                console.log(`SKIP ${product.title} (images pehle se hain)`);
                continue;
            }

            const dir = path.join(IMAGES_DIR, folder);
            const files = getImageFiles(dir);
            if (!files.length) {
                console.log(`EMPTY ${product.title}: folder mein image nahi`);
                failed++;
                continue;
            }

            const ikFolder = `/dearkeeps/products/${product.slug}`;
            const newImages = [];

            for (const f of files) {
                try {
                    const { url, publicId } = await uploadfile(path.join(dir, f), ikFolder);
                    newImages.push({ url, publicId });
                    uploaded++;
                } catch (e) {
                    console.log(`  ERR file ${f}: ${e.message}`);
                }
            }

            if (!newImages.length) {
                failed++;
                console.log(`ERR ${product.title}: ek bhi image upload nahi hui`);
                continue;
            }

            product.images = newImages;
            await product.save();
            updated++;
            console.log(`OK  ${product.title}  ->  ${newImages.length} image(s)`);
        } catch (e) {
            failed++;
            console.log(`ERR ${product.title}: ${e.message}`);
        }
    }

    console.log(
        `\nDone. Products updated: ${updated}, Images uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`
    );
    await mongoose.disconnect();
})();