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
// ---------- Auto model selection ----------
// Groq models aate-jaate rehte hain. Ye code khud Groq se available models ki list leta hai,
// pasandida model chalata hai, aur agar koi model band ho jaye to agle model par chala jata hai.
// .env / Render me GROQ_MODEL:
//   (khali / "auto")  -> neeche ki MODEL_PREFERENCE list, phir baaki sab naye models (STABLE, recommended)
//   "latest"          -> hamesha sabse naya available chat model pehle try karega
//   "koi-model-naam"  -> wo model pehle try hoga, band ho gaya to auto fallback
const MODEL_PREFERENCE = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];
// Chat ke kaam ke nahi (speech, safety, embedding, etc.)
const NOT_CHAT = /whisper|tts|playai|orpheus|guard|safeguard|embed|compound|transcribe|moderation/i;
const MODEL_CACHE_MS = 6 * 60 * 60 * 1000; // list 6 ghante cache
const BAD_MODEL_MS = 60 * 60 * 1000; // band model 1 ghante skip
const MAX_TRIES = 4;

let modelCache = { list: [], fetchedAt: 0, retryAt: 0 };
const badModels = new Map(); // modelId -> kab tak skip karna hai
let lastUsedModel = null;

const refreshModels = async () => {
  const now = Date.now();
  if (modelCache.list.length && now - modelCache.fetchedAt < MODEL_CACHE_MS) return;
  if (now < modelCache.retryAt) return;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const j = await r.json();
    const list = (j.data || [])
      .filter((m) => m?.id && m.active !== false && !NOT_CHAT.test(m.id))
      .sort((a, b) => (b.created || 0) - (a.created || 0)) // naye pehle
      .map((m) => m.id);
    if (list.length) modelCache = { list, fetchedAt: now, retryAt: 0 };
  } catch (err) {
    console.error('Groq models list error:', err.message);
    modelCache.retryAt = now + 60 * 1000; // 1 minute baad dobara try
  }
};

const buildCandidates = async () => {
  await refreshModels();
  const now = Date.now();
  const available = modelCache.list; // khali ho sakti hai agar list API fail hui
  const usable = (id) => !(badModels.get(id) > now) && (!available.length || available.includes(id));
  const ordered = [];
  const push = (id) => {
    if (id && !ordered.includes(id) && usable(id)) ordered.push(id);
  };

  const pref = (process.env.GROQ_MODEL || '').trim();
  if (pref.toLowerCase() === 'latest') {
    available.forEach(push);
    MODEL_PREFERENCE.forEach(push);
  } else {
    if (pref && pref.toLowerCase() !== 'auto') push(pref);
    MODEL_PREFERENCE.forEach(push);
    available.forEach(push); // preference list ke sab model band ho gaye to naye models
  }
  if (!ordered.length) ordered.push(MODEL_PREFERENCE[0]); // list API aur sab fail: aakhri koshish
  return ordered.slice(0, MAX_TRIES);
};

// Model band / hata diya gaya hai?
const isModelGone = (status, body) =>
  status === 404 ||
  (status === 400 && /decommission|deprecat|not found|does not exist|model_not_found|no longer|not supported/i.test(body));

const cleanReply = (text) =>
  (text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '') // kuch models soch (think) bhi bhejte hain
    .trim();

const callGroq = async (model, systemPrompt, messages) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.5,
        // reasoning models me thinking tokens bhi isi limit me ginte hain, isliye limit badi hai
        max_tokens: 1000,
        ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
      }),
    });
    const text = await response.text();
    if (!response.ok) return { ok: false, status: response.status, body: text };
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (_) {
      /* ignore */
    }
    return { ok: true, status: 200, reply: cleanReply(data.choices?.[0]?.message?.content) };
  } catch (err) {
    return { ok: false, status: 0, body: err.message };
  }
};

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

  const systemPrompt = buildSystemPrompt(matched, fallback);
  const candidates = await buildCandidates();

  let reply = '';
  for (const model of candidates) {
    const out = await callGroq(model, systemPrompt, messages);

    if (out.ok && out.reply) {
      reply = out.reply;
      if (lastUsedModel !== model) {
        console.log('Chat model in use:', model);
        lastUsedModel = model;
      }
      break;
    }
    if (out.ok) {
      console.error('Chat model gave empty reply:', model);
      continue; // khali jawab: agla model
    }

    console.error('Chat provider error:', model, out.status, String(out.body).slice(0, 300));
    if (out.status === 401 || out.status === 403) break; // key galat, models badalne se fayda nahi
    if (isModelGone(out.status, String(out.body))) {
      badModels.set(model, Date.now() + BAD_MODEL_MS);
      modelCache.fetchedAt = 0; // list dobara fetch ho
    }
    // 429 / 5xx / model gone: agla model try hoga
  }

  if (!reply) {
    return res.status(502).json({ message: 'Chatbot abhi available nahi hai, thodi der baad try karo' });
  }

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