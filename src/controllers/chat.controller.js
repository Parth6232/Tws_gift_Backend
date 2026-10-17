const productModel = require('../models/product.model');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// User ke message se related products dhundo (text search, fir keyword fallback)
const findProducts = async (query) => {
  const base = { isActive: true };
  let items = await productModel
    .find({ ...base, $text: { $search: query } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5)
    .populate('category', 'name');

  if (!items.length) {
    const words = query.split(/\s+/).filter((w) => w.length > 2).slice(0, 5).map(escapeRegex);
    if (words.length) {
      items = await productModel
        .find({
          ...base,
          $or: words.flatMap((w) => [{ title: new RegExp(w, 'i') }, { tags: new RegExp(w, 'i') }]),
        })
        .limit(5)
        .populate('category', 'name');
    }
  }
  return items;
};

const productLine = (p) =>
  `- ${p.title} | Rs.${p.price}${p.comparePrice ? ` (MRP Rs.${p.comparePrice})` : ''} | ${p.category?.name || 'General'
  } | ${p.soldOut ? 'Sold out' : 'In stock'} | link: /product/${p.slug}`;

const buildSystemPrompt = (matched, fallback) => `You are the friendly shopping assistant of TWS Gifts (TWS Personalized & Corporate Gifting), an online store from Indore, India. Tagline: "Thoughtful Wishes. Special Moments." Never call yourself "Dear" or mention DearKeeps.

About the store (share these facts when asked):
- TWS was started in Indore in 2025 by Aniruddha Gupta, the young founder. The idea: gifting should be affordable for everyone, and every gift sold should help someone else.
- Gift with purpose: 1 gift purchased = 1 stationery kit donated to a child in need. Details of the stationery kit distribution are shared personally, one-to-one, on WhatsApp with the customer.
- We offer personalized gifts, corporate and bulk gifting, branded apparel, bags and accessories, and some handicraft products. Do NOT claim that all products are handmade or handcrafted.
- Corporate and bulk orders: WhatsApp 8109101811. Email: twsgiftsqcs@gmail.com.

Rules:
- Reply in the same language the user writes in (English, Hindi or Hinglish). Keep replies short (2-4 sentences), warm and helpful.
- Use ONLY the product data below for product names, prices and availability. Never invent products, prices, offers or delivery promises.
- If nothing below fits, say so honestly and suggest browsing the Shop page or describing the occasion/budget.
- Prices are in Indian Rupees (Rs.). Personalization (name engraving, photo print) is available on many products; for exact details ask the user to open the product page.
- For orders, delivery time, refunds or anything not in the data, tell the user to contact us on WhatsApp 8109101811 or email twsgiftsqcs@gmail.com. Do not make up policies.
- Politely decline questions unrelated to gifts or the store.

${matched.length ? `Products matching the user's latest message:\n${matched.map(productLine).join('\n')}` : 'No product matched the latest message.'}
${!matched.length && fallback.length ? `\nPopular products you may suggest:\n${fallback.map(productLine).join('\n')}` : ''}`;

// POST /api/chat   body: { messages: [{ role: 'user'|'assistant', content: '...' }] }
const chat = async (req, res) => {
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = raw
    .filter((m) => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 500) }));

  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') {
    return res.status(400).json({ message: 'Last message user ka hona chahiye' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ message: 'Chatbot abhi configure nahi hai' });
  }

  const matched = await findProducts(last.content);
  const fallback = matched.length
    ? []
    : await productModel.find({ isActive: true, isBestSeller: true }).limit(5).populate('category', 'name');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: buildSystemPrompt(matched, fallback) }, ...messages],
      temperature: 0.5,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    console.error('Chat provider error:', response.status, await response.text());
    return res.status(502).json({ message: 'Chatbot abhi available nahi hai, thodi der baad try karo' });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) return res.status(502).json({ message: 'Chatbot se jawab nahi mila' });

  res.json({
    reply,
    // Frontend chat me product cards dikhane ke liye (sirf jab search match hua)
    products: matched.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice,
      image: p.images?.[0]?.url || null,
      soldOut: p.soldOut,
    })),
  });
};

module.exports = { chat };