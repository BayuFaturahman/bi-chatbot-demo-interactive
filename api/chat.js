
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const salesData = [
  { label: "05 Mar", value: 32 },
  { label: "06 Mar", value: 28 },
  { label: "07 Mar", value: 35 },
  { label: "08 Mar", value: 31 },
  { label: "09 Mar", value: 38 },
  { label: "10 Mar", value: 40 },
  { label: "11 Mar", value: 41 },
];

const branchData = [
  { label: "Jakarta", value: 68 },
  { label: "Bandung", value: 54 },
  { label: "Surabaya", value: 49 },
  { label: "Bekasi", value: 42 },
  { label: "Tangerang", value: 37 },
];

const productData = [
  { label: "Beras", value: 26 },
  { label: "Minyak", value: 23 },
  { label: "Gula", value: 21 },
  { label: "Telur", value: 19 },
  { label: "Mie", value: 17 },
];

function normalizeText(text = "") {
  return text.toLowerCase().trim();
}

function isGreeting(text) {
  const greetings = [
    "hi", "hii", "halo", "hallo", "hai", "hello",
    "pagi", "siang", "sore", "malam",
    "assalamualaikum", "assalamu'alaikum",
  ];
  return greetings.some((word) => text === word || text.startsWith(word + " "));
}

function isThanks(text) {
  const words = ["makasih", "terima kasih", "thanks", "thank you"];
  return words.some((word) => text.includes(word));
}

function classifyMessage(text) {
  if (isGreeting(text)) return "greeting";
  if (isThanks(text)) return "thanks";

  if (
    text.includes("penjualan") ||
    text.includes("sales") ||
    text.includes("omzet") ||
    text.includes("transaksi")
  ) return "sales";

  if (text.includes("cabang")) return "branch";
  if (text.includes("produk") || text.includes("barang")) return "product";

  if (
    text.includes("papua") ||
    text.includes("1990") ||
    text.includes("1980") ||
    text.includes("1800") ||
    text.includes("mars") ||
    text.includes("tidak ada")
  ) return "no_data";

  return "general";
}

async function askOpenAI(message) {
  const response = await client.responses.create({
    model: "gpt-5.4",
    input: [
      {
        role: "system",
        content:
          "Kamu adalah asisten bisnis berbahasa Indonesia. Jawab singkat, natural, dan profesional. Jika pertanyaan bukan data internal, jawab sebagai asisten umum.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return {
    text: response.output_text || "Maaf, saya belum bisa menjawab saat ini.",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "Method not allowed" });
  }

  try {
    const message = normalizeText(req.body?.message || "");

    if (!message) {
      return res.status(200).json({ text: "Silakan tulis pertanyaan terlebih dahulu." });
    }

    const category = classifyMessage(message);

    if (category === "greeting") {
      return res.status(200).json({
        text: "Halo juga. Saya siap bantu percakapan umum maupun laporan data bisnis Anda.",
      });
    }

    if (category === "thanks") {
      return res.status(200).json({
        text: "Sama-sama. Silakan lanjut kalau ada yang ingin ditanyakan lagi.",
      });
    }

    if (category === "sales") {
      return res.status(200).json({
        text: "Berikut ringkasan penjualan 7 hari terakhir. Total penjualan mencapai Rp 245.000.000 dan naik 12% dibanding periode sebelumnya.",
        chartTitle: "Trend Penjualan 7 Hari",
        chart: salesData,
      });
    }

    if (category === "branch") {
      return res.status(200).json({
        text: "Berikut performa cabang minggu ini. Cabang dengan kontribusi tertinggi adalah Jakarta, disusul Bandung dan Surabaya.",
        chartTitle: "Top Cabang",
        chart: branchData,
      });
    }

    if (category === "product") {
      return res.status(200).json({
        text: "Berikut produk dengan omzet tertinggi minggu ini. Tiga teratas saat ini adalah Beras, Minyak, dan Gula.",
        chartTitle: "Top Produk",
        chart: productData,
      });
    }

    if (category === "no_data") {
      return res.status(200).json({
        text: "Maaf, saya tidak menemukan data yang sesuai. Coba ubah periode, nama cabang, atau kata kunci pencarian.",
      });
    }

    const aiReply = await askOpenAI(message);
    return res.status(200).json(aiReply);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      text: "Terjadi error saat menghubungi OpenAI API.",
    });
  }
}