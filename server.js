import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

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

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function isGreeting(text) {
  const greetings = [
    "hi",
    "hii",
    "halo",
    "hallo",
    "hai",
    "hello",
    "pagi",
    "siang",
    "sore",
    "malam",
    "assalamualaikum",
    "assalamu'alaikum",
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
  ) {
    return "sales";
  }

  if (text.includes("cabang")) {
    return "branch";
  }

  if (text.includes("produk") || text.includes("barang")) {
    return "product";
  }

  if (
    text.includes("papua") ||
    text.includes("1990") ||
    text.includes("1980") ||
    text.includes("1800") ||
    text.includes("mars") ||
    text.includes("tidak ada")
  ) {
    return "no_data";
  }

  return "general";
}

function getSalesResponse() {
  return {
    text: "Berikut ringkasan penjualan 7 hari terakhir. Total penjualan mencapai Rp 245.000.000 dan naik 12% dibanding periode sebelumnya.",
    chartTitle: "Trend Penjualan 7 Hari",
    chart: salesData,
  };
}

function getBranchResponse() {
  return {
    text: "Berikut performa cabang minggu ini. Cabang dengan kontribusi tertinggi adalah Jakarta, disusul Bandung dan Surabaya.",
    chartTitle: "Top Cabang",
    chart: branchData,
  };
}

function getProductResponse() {
  return {
    text: "Berikut produk dengan omzet tertinggi minggu ini. Tiga teratas saat ini adalah Beras, Minyak, dan Gula.",
    chartTitle: "Top Produk",
    chart: productData,
  };
}

function getNoDataResponse() {
  return {
    text: "Maaf, saya tidak menemukan data yang sesuai. Coba ubah periode, nama cabang, atau kata kunci pencarian.",
  };
}

function getGreetingResponse() {
  return {
    text: randomPick([
      "Halo juga. Saya siap bantu percakapan umum maupun laporan data bisnis Anda.",
      "Hai. Silakan tanya apa saja, baik percakapan biasa maupun data penjualan, cabang, dan produk.",
      "Halo, saya siap membantu. Anda bisa chat biasa atau minta ringkasan data dan chart.",
    ]),
  };
}

function getThanksResponse() {
  return {
    text: randomPick([
      "Sama-sama. Silakan lanjut kalau ada yang ingin ditanyakan lagi.",
      "Siap, dengan senang hati. Lanjutkan saja pertanyaannya.",
      "Sama-sama. Saya siap bantu lagi kapan saja.",
    ]),
  };
}

async function askExternalAI(message) {
  return {
    text: `Saya memahami pertanyaan Anda: "${message}". Saat ini versi demo ini bisa menangani percakapan umum dan permintaan data sederhana. Langkah berikutnya, fungsi ini bisa dihubungkan ke OpenAI, Gemini, Claude, atau Ollama.`,
  };
}

app.post("/api/chat", async (req, res) => {
  const message = normalizeText(req.body.message || "");

  if (!message) {
    return res.json({ text: "Silakan tulis pertanyaan terlebih dahulu." });
  }

  const category = classifyMessage(message);

  if (category === "greeting") {
    return res.json(getGreetingResponse());
  }

  if (category === "thanks") {
    return res.json(getThanksResponse());
  }

  if (category === "sales") {
    return res.json(getSalesResponse());
  }

  if (category === "branch") {
    return res.json(getBranchResponse());
  }

  if (category === "product") {
    return res.json(getProductResponse());
  }

  if (category === "no_data") {
    return res.json(getNoDataResponse());
  }

  const aiReply = await askExternalAI(message);
  return res.json(aiReply);
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});