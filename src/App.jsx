import { useState } from "react";

const scenarios = {
  sales: {
    answer:
      "Total penjualan 7 hari terakhir adalah Rp 245.000.000, naik 12% dibanding periode sebelumnya.",
    chartTitle: "Trend Penjualan 7 Hari",
    chart: [
      { label: "05 Mar", value: 32 },
      { label: "06 Mar", value: 28 },
      { label: "07 Mar", value: 35 },
      { label: "08 Mar", value: 31 },
      { label: "09 Mar", value: 38 },
      { label: "10 Mar", value: 40 },
      { label: "11 Mar", value: 41 },
    ],
  },
  branch: {
    answer:
      "Cabang terbaik minggu ini adalah Jakarta Pusat, disusul Bandung dan Surabaya.",
    chartTitle: "Top Cabang",
    chart: [
      { label: "Jkt Pusat", value: 68 },
      { label: "Bandung", value: 54 },
      { label: "Surabaya", value: 49 },
      { label: "Bekasi", value: 42 },
      { label: "Tangerang", value: 37 },
    ],
  },
  product: {
    answer:
      "Produk dengan omzet tertinggi minggu ini adalah Beras Premium, Minyak Goreng 2L, dan Gula Pasir.",
    chartTitle: "Top Produk",
    chart: [
      { label: "Beras", value: 26 },
      { label: "Minyak", value: 23 },
      { label: "Gula", value: 21 },
      { label: "Telur", value: 19 },
      { label: "Mie", value: 17 },
    ],
  },
};

function detectScenario(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("cabang")) return scenarios.branch;
  if (text.includes("produk") || text.includes("barang")) return scenarios.product;
  return scenarios.sales;
}

function MiniChart({ title, data }) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-700 mb-3">{title}</div>

      <div className="h-48 flex items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-[10px] text-slate-500">{item.value}</div>

            <div className="w-full h-32 bg-slate-100 rounded-lg flex items-end p-1">
              <div
                className="w-full bg-blue-600 rounded-md transition-all duration-500"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>

            <div className="text-[10px] text-slate-500 text-center">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl bg-slate-100 text-slate-800 px-4 py-3 text-sm">
        <div>{msg.text}</div>
        {msg.chart && <MiniChart title={msg.chartTitle} data={msg.chart} />}
      </div>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Halo, saya siap membantu report penjualan, cabang, dan produk.",
    },
  ]);

  const runPrompt = (prompt) => {
    if (!prompt.trim()) return;

    const scenario = detectScenario(prompt);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt },
      {
        role: "assistant",
        text: scenario.answer,
        chartTitle: scenario.chartTitle,
        chart: scenario.chart,
      },
    ]);

    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runPrompt(input);
  };

  const quickPrompts = [
    "Tampilkan penjualan 7 hari terakhir",
    "Tampilkan performa cabang minggu ini",
    "Top produk minggu ini",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">BI Chatbot Demo</h1>
            <p className="text-sm text-slate-500 mt-1">
              Menudahkan Anda mendapatkan insight penjualan, performa cabang, dan produk hanya dengan bertanya!
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => runPrompt(prompt)}
                className="mr-2 mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-4 h-[520px] overflow-y-auto rounded-2xl bg-slate-50 p-4 border border-slate-200">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan report..."
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 text-white px-4 py-3 hover:bg-blue-700"
            >
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}