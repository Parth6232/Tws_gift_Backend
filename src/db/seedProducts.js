/**
 * One-time seed: Jack & Jones / Vero Moda (stock report 28-02-2026)
 *               + Pepe Jeans London (stock report 14-04-2026)
 *
 * Kahan rakhna hai : <backend>/src/db/seedProducts.js   (purani file replace kar do)
 * Kaise chalana     : backend folder me ->  node src/db/seedProducts.js
 * Pehle check karna : node src/db/seedProducts.js --dry     (DB me kuch nahi likhta)
 *
 * - Price = PDF ka MRP.  Stock = PDF ki saari rows (warehouse + incoming) ka total.
 * - Category na ho to khud ban jati hai.
 * - Dubara chalane par same title wale products skip hote hain (duplicate nahi banenge),
 *   isliye purani 64 entries skip hongi aur sirf naye products add honge.
 * - Images nahi judti: seedImages.js se bulk upload karo (ya admin panel se).
 */
const JJ = 'Jack & Jones';
const VM = 'Vero Moda';
const PEPE = 'Pepe Jeans London';

// ---------- DATA ----------
// s(): ek style. variants = [[color, totalStock], ...]
const s = (brand, name, category, price, specs, variants, opts = {}) => ({
    brand, name, category, price, specs, variants, ...opts,
});

const STYLES = [
    // ===== Jack & Jones / Vero Moda =====
    s(JJ, 'Joren Round Neck', 'T-Shirts', 1199,
        ['100% Cotton', 'Combed Cotton', 'GSM 180', 'Bio Washed', 'BCI Sourced Cotton', 'Elastic collar'],
        [['White', 15551], ['Black', 24709]]),

    s(JJ, 'Plain Polo', 'Polo T-Shirts', 1799,
        ['100% Cotton', 'Pique Fabric', 'GSM 230', 'Honeycomb Finish', 'BCI Sourced Cotton'],
        [['Black', 31308], ['White', 11175], ['Navy Blue', 13953], ['Electric Blue', 1405]]),
    s(JJ, 'Plain Polo', 'Polo T-Shirts', 1799,
        ['55% Cotton & 45% Polyester', 'Pique Fabric', 'GSM 230', 'Honeycomb Finish'],
        [['Charcoal Grey Melange', 1598]]),
    s(VM, 'Plain Polo', 'Polo T-Shirts', 1799,
        ['100% Cotton', 'Pique Fabric', 'GSM 210', 'Honeycomb Finish', 'BCI Sourced Cotton'],
        [['Black', 5121], ['Navy Blue', 2233]], { women: true }),

    s(JJ, 'Madd Polo', 'Polo T-Shirts', 1699,
        ['60% Cotton & 40% Polyester', 'Pique Fabric', 'GSM 180', 'Wrinkle Resistance', 'Anti-Pilling', 'Moisture absorption'],
        [['White', 980]]),

    s(JJ, 'Jacquard Polo', 'Polo T-Shirts', 2299,
        ['100% Cotton', 'Pique Fabric Combed', 'GSM 230', 'Jacquard Finish Collar & Sleeve', 'Bio-Wash Traits'],
        [['Wine', 10549], ['White', 4874], ['Black', 7093]]),
    s(VM, 'Jacquard Polo', 'Polo T-Shirts', 2299,
        ['100% Cotton', 'Pique Fabric Combed', 'GSM 210', 'Jacquard Finish Collar & Sleeve', 'Bio-Wash Traits'],
        [['Wine', 2183], ['White', 3050]], { women: true }),

    s(JJ, 'InterLock Polo', 'Polo T-Shirts', 2499,
        ['100% Cotton', 'Double Knit Fabric', 'GSM 210', 'Ultra-soft', 'Light weight', 'Easy to iron'],
        [['Black', 10114], ['Navy Blue', 7806], ['Olive Green', 677]]),

    s(JJ, 'Viktor Polo', 'Polo T-Shirts', 2799,
        ['100% Cotton', 'Yarn Dyed Pique Fabric', 'GSM 230', 'Dual Tone Effect', 'Bio Washed', 'Two Tuck Pique'],
        [['Black-Grey', 5914], ['Light Blue', 5808]], { premium: true }),

    s(JJ, 'Austin Jacket', 'Jackets', 2999,
        ['60% Cotton & 40% Polyester', 'GSM 280', 'Bio-Washed', '365 days gear', 'Soft luxurious hand feel'],
        [['Black', 8036]]),
    s(VM, 'Austin Jacket', 'Jackets', 2999,
        ['60% Cotton & 40% Polyester', 'GSM 280', 'Bio-Washed', '365 days gear', 'Soft luxurious hand feel'],
        [['Black', 1594], ['Charcoal Melange Grey', 2209]], { women: true }),
    s(JJ, 'Austin Hoodie', 'Jackets', 3299,
        ['60% Cotton & 40% Polyester', 'GSM 280', 'Bio-Washed', '365 days gear', 'Soft luxurious hand feel'],
        [['Petrol', 4212]]),

    s(JJ, 'Daniel Knit Blazer', 'Blazers', 12999,
        ['98% Polyester & 2% Spandex', 'Polyester Spandex Knit', 'Tailored Fit', 'Notch Lapel', '2 outer pockets, 1 inner pocket'],
        [['Black', 360]], { premium: true }),

    s(JJ, 'Nashville Track Pant', 'Track Pants', 2299,
        ['100% Polyester', 'GSM 220', 'Dry fit & Light Weight', 'Texture Finish'],
        [['Black', 4352], ['Navy Blue', 6457]]),

    s(VM, 'Carline Shirt', 'Shirts', 3499,
        ['98% Cotton & 2% Elastane', 'Satin Stretch Fabric', 'Satin Sheen Finish', '2-Way Stretch'],
        [['Barely Pink', 2143]], { women: true }),

    // --- J&J Backpacks ---
    s(JJ, 'Theo Pro Backpack', 'Backpacks', 3199,
        ['100% Premium Polyester', 'Two main compartments', 'Laptop compartment', 'Side bottle pocket', 'Capacity 30 Ltr'],
        [['Black', 8]]),
    s(JJ, 'Jeff Max Backpack', 'Backpacks', 3999,
        ['100% Premium Upgraded Polyester', '17 inch Laptop & iPad compartment', 'Water resistant', 'Shoe compartment', 'Capacity 25 Ltr'],
        [['Black', 331]]),
    s(JJ, 'Molded Backpack', 'Backpacks', 6499,
        ['100% Polyester', 'Spandex PU, Check Dobby & 190T lining', '15 inch Laptop compartment', '#5 CFC zipper', 'Side mesh bottle pocket & rear anti-theft pocket', 'Capacity 20 Ltr'],
        [['Black', 336]]),

    // --- J&J Duffle Bags ---
    s(JJ, 'Arne Duffle', 'Duffle Bags', 1999,
        ['100% Polyester', 'Quick access pocket', 'Shoulder strap', 'Branded zipper', 'H25 x W45 x L25 cm', 'Shoe compartment', 'Capacity 20 Ltr'],
        [['Black', 3000], ['Green', 6324]]),
    s(JJ, 'Hugo Duffle', 'Duffle Bags', 2199,
        ['PU Leather', 'One compartment with zip opening', 'Back zipper pocket', 'Shoulder strap', 'H22 x W44 x L22 cm', 'Capacity 22 Ltr'],
        [['Navy Blue', 1065]]),
    s(JJ, 'Walter Duffle Pro', 'Duffle Bags', 4499,
        ['100% PU Leather', 'Twin handle grip', 'Premium zipper', 'Adjustable & detachable shoulder strap', 'H33 x W49 x L22 cm', 'Shoe compartment', 'Capacity 40 Ltr'],
        [['Black', 5052]]),
    s(JJ, 'VG Andrew Duffle', 'Duffle Bags', 5999,
        ['100% PU Leather', 'Twin handle grip', 'CFC zip', 'Adjustable & detachable shoulder strap', 'H26 x W45 x L25 cm', 'Side zipper pocket', 'Shoe compartment', 'Capacity 30 Ltr'],
        [['Black', 88]]),
    s(JJ, 'Mike Duffle', 'Duffle Bags', 6999,
        ['100% PU Leather', 'Twin handle grip', 'Red Vizlon zip', 'Adjustable & detachable shoulder strap', 'H26 x W40 x L20 cm', 'Shoe compartment', 'Capacity 32 Ltr'],
        [['Black', 350]]),
    s(JJ, 'Rogger Duffle', 'Duffle Bags', 6999,
        ['100% PU Leather', 'Twin handle grip', 'CFC zipper', 'Adjustable & detachable shoulder strap', 'H26 x W40 x L20 cm', 'Shoe compartment', 'Capacity 30 Ltr'],
        [['Olive Green', 500]]),

    // --- J&J File Case ---
    s(JJ, 'Hugo File Case', 'File Cases', 3049,
        ['100% PU Leather', 'Fits 15 inch laptop', 'Twin grip handle', 'Adjustable & detachable shoulder strap', 'H39 x W29 x L8 cm', 'Luggage sleeve', 'Capacity 10 Ltr'],
        [['Navy Blue', 1151]]),

    // --- J&J Sling Bags ---
    s(JJ, 'Hugo Sling', 'Sling Bags', 1299,
        ['PU Leather', 'Two compartments with zip opening', 'Cushioned strap belt', 'Front zipper pocket', 'H23 x W18 x L5 cm', 'Capacity 2.5 Ltr'],
        [['Navy Blue', 1453]]),
    s(JJ, 'Hagen Sling', 'Sling Bags', 1299,
        ['PU Leather', 'Two compartments with zip opening', 'Cushioned strap belt', 'Front zipper pocket', 'H23 x W18 x L5 cm', 'Capacity 2.5 Ltr'],
        [['Green', 1000]]),
    s(JJ, 'Artis Sling', 'Sling Bags', 2299,
        ['Front part PU Leather, rest Polyester', 'Two CFC zip compartments', 'Detachable shoulder strap', 'CFC zipper', 'Mesh pocket', 'H24 x W18 x L5 cm', 'Capacity 3 Ltr'],
        [['Black', 1028]]),

    // ===== Pepe Jeans London =====
    s(PEPE, 'Ibiza Round Neck', 'T-Shirts', 1299,
        ['95% Cotton & 5% Elastane', 'Jersey Fabric', 'Combed Cotton', 'GSM 180'],
        [['White', 4466], ['Black', 3435]]),

    s(PEPE, 'Organico Polo', 'Polo T-Shirts', 2299,
        ['100% Organic Cotton', 'Pique Fabric', 'Combed Cotton', 'GSM 230'],
        [['Black', 5538], ['White', 3203], ['Light Blue', 4668]]),
    s(PEPE, 'Milano Polo', 'Polo T-Shirts', 2299,
        ['95% Cotton & 5% Elastane', 'Pique Fabric', 'Combed Cotton', 'GSM 220'],
        [['White', 5372], ['Green', 3788], ['Black', 9026], ['Wine', 4914], ['Navy Blue', 6023]]),
    s(PEPE, 'Ella Polo', 'Polo T-Shirts', 2299,
        ['95% Cotton & 5% Elastane', 'Pique Fabric', 'Combed Cotton', 'GSM 220'],
        [['Black', 1566], ['White', 1898], ['Navy Blue', 1222]], { women: true }),
    s(PEPE, 'Berlinn Polo', 'Polo T-Shirts', 2399,
        ['100% Cotton', 'Pique Cotton Fabric', 'GSM 230', 'Shoulder Bonding'],
        [['Black', 5288], ['White', 881]], { premium: true }),
    s(PEPE, 'Madrid Polo', 'Polo T-Shirts', 2499,
        ['95% Cotton & 5% Elastane', 'Pique Cotton Fabric', 'GSM 240', 'Bio Wash', 'Tipping collar'],
        [['Black', 4137], ['Navy', 5044]]),

    s(PEPE, 'Piccadilly Jacket', 'Jackets', 3499,
        ['60% Cotton & 40% Polyester', 'GSM 280', 'Bio-Washed', '365 days gear', 'Soft luxurious hand feel'],
        [['Black', 5000]]),
    s(PEPE, 'Westminster Windcheater', 'Jackets', 4499,
        ['100% Polyester', 'Wind Proof', 'Water Repellent'],
        [['Black', 5000]]),

    s(PEPE, 'Boston Sling Bag', 'Sling Bags', 1299,
        ['PU Leather', '21H x 18W x 4D cm', 'Capacity 1.5 Ltr', 'Water Resistant', 'Two compartments with zip'],
        [['Black', 1917], ['Navy', 1921]]),
    s(PEPE, 'Miami Sling Bag', 'Sling Bags', 1199,
        ['PU Leather & Polyester', '21H x 15W x 4.5D cm', 'Capacity 1.5 Ltr', 'Water Resistant', 'Front mesh pocket'],
        [['Black', 2000], ['Navy', 2000]]),
    s(PEPE, 'Vegas Sling Bag', 'Sling Bags', 1149,
        ['PU Leather', '18H x 12W x 8D cm', 'Capacity 1.8 Ltr', 'Water Resistant', 'Front mesh pocket'],
        [['Olive', 2000], ['Black', 2000]]),

    s(PEPE, 'Dallas Backpack', 'Backpacks', 2999,
        ['PU & Polyester', '48H x 30W x 17D cm', 'Capacity 25 Ltr', '15 inch Laptop & iPad compartment', 'Water Resistant'],
        [['Black', 2000]]),
    s(PEPE, 'Denver Backpack', 'Backpacks', 3199,
        ['PU & Polyester', '48H x 32W x 21D cm', 'Capacity 33 Ltr', '15 inch Laptop & iPad compartment', 'Water Resistant'],
        [['Black', 2000]]),
    s(PEPE, 'Soho Backpack', 'Backpacks', 4199,
        ['1000D PU-Coated', '45H x 32W x 15D cm', 'Capacity 25 Ltr', '15 inch Laptop & iPad compartment', 'USB charging port', 'Water Resistant'],
        [['Black', 2000]]),
    s(PEPE, 'London Backpack', 'Backpacks', 4999,
        ['Polyester', '48H x 30W x 16D cm', 'Capacity 25 Ltr', '15 inch Laptop & iPad compartment', 'Water Resistant'],
        [['Black', 1500]]),

    s(PEPE, 'Fleet Street Duffle', 'Duffle Bags', 1999,
        ['Polyester', '47H x 23W x 23D cm', 'Capacity 25 Ltr', 'Shoe compartment', 'Water Resistant'],
        [['Black', 1200], ['Navy Blue', 2000]]),
    s(PEPE, 'Bond Street Duffle', 'Duffle Bags', 2599,
        ['PU Leather & Polyester', '50H x 26W x 26D cm', 'Capacity 33.8 Ltr', 'Height adjustable straps', 'Water Resistant'],
        [['Black', 2000], ['Blue', 2000]]),
    s(PEPE, 'Regent Street Duffle', 'Duffle Bags', 3999,
        ['PU Leather', '48H x 30W x 23D cm', 'Capacity 33 Ltr', 'Shoe compartment', 'Water Resistant'],
        [['Black', 1000]]),
    s(PEPE, 'Oxford Duffle', 'Duffle Bags', 2999,
        ['PU Leather', '47H x 26W x 21D cm', 'Capacity 25.6 Ltr', 'Front access pocket', 'Water Resistant'],
        [['Navy Blue', 2000], ['Black', 2000]]),
    s(PEPE, 'Baker Street Duffle', 'Duffle Bags', 4999,
        ['PU Leather', '48H x 30W x 24D cm', 'Capacity 34.5 Ltr', 'Height adjustable straps', 'Water Resistant'],
        [['Black', 1500]]),
];

const UNISEX_CATEGORIES = ['Backpacks', 'Sling Bags', 'Duffle Bags', 'File Cases'];

// ---------- Flatten: 1 style x 1 color = 1 product ----------
const buildProducts = () =>
    STYLES.flatMap((st) =>
        st.variants.map(([color, stock]) => ({
            title: `${st.brand} ${st.name} - ${color}`,
            description: `${st.brand} ${st.name} in ${color}.\n\n` + st.specs.map((x) => `• ${x}`).join('\n'),
            price: st.price, // MRP
            stock,
            categoryName: st.category,
            tags: [st.brand, color, st.name, st.women ? 'Women' : UNISEX_CATEGORIES.includes(st.category) ? 'Unisex' : 'Men'],
            isPremium: !!st.premium,
            isNewArrival: true,
            isBestSeller: false,
            freeShipping: true,
            isActive: true,
        }))
    );

// ---------- Run ----------
(async () => {
    const products = buildProducts();
    const dry = process.argv.includes('--dry');

    if (dry) {
        const cats = {};
        products.forEach((p) => (cats[p.categoryName] = (cats[p.categoryName] || 0) + 1));
        console.log(`DRY RUN: ${products.length} products`);
        console.table(cats);
        console.log('Total stock:', products.reduce((a, p) => a + p.stock, 0));
        products.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.title}  | Rs.${p.price} | stock ${p.stock} | ${p.categoryName}`));
        return;
    }

    require('dotenv').config();
    const mongoose = require('mongoose');
    const productModel = require('../models/product.model');
    const categoryModel = require('../models/category.model');
    const userModel = require('../models/user.model');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected');

    const admin = await userModel.findOne({ role: 'admin' });
    if (!admin) {
        console.error('Admin user nahi mila. Pehle `npm run dev` ek baar chalao (.env me ADMIN_EMAIL/ADMIN_PASSWORD ke saath) phir ye script.');
        process.exit(1);
    }

    // categories (find-or-create)
    const catIds = {};
    for (const name of [...new Set(products.map((p) => p.categoryName))]) {
        const cat = (await categoryModel.findOne({ name })) || (await categoryModel.create({ name }));
        catIds[name] = cat._id;
    }

    let added = 0, skipped = 0;
    for (const { categoryName, ...p } of products) {
        if (await productModel.exists({ title: p.title })) { skipped++; continue; }
        await productModel.create({ ...p, category: catIds[categoryName], images: [], createdBy: admin._id });
        added++;
    }
    console.log(`Done. Added: ${added}, Skipped (already exist): ${skipped}`);
})()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => (process.argv.includes('--dry') ? null : require('mongoose').disconnect()));