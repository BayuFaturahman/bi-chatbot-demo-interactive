import { useState } from "react";

function MiniChart({ title, data }) {
  if (!data?.length) return null;

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
        <div className="max-w-[80%] rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm leading-6">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl bg-slate-100 text-slate-800 px-4 py-3 text-sm leading-6">
        <div>{msg.text}</div>
        {msg.chart && <MiniChart title={msg.chartTitle} data={msg.chart} />}
      </div>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Halo, saya siap membantu Anda. Anda bisa chat biasa atau meminta data seperti penjualan, cabang, dan produk.",
    },
  ]);

  const runPrompt = async (prompt) => {
    if (!prompt.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
                method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text || "Maaf, saya belum bisa menjawab saat ini.",
          chartTitle: data.chartTitle,
          chart: data.chart,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Maaf, koneksi ke server gagal. Pastikan backend berjalan di http://localhost:3001.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runPrompt(input);
  };

  const quickPrompts = [
    "Halo",
    "Tampilkan penjualan 7 hari terakhir",
    "Tampilkan performa cabang minggu ini",
    "Top produk minggu ini",
    "Tampilkan data cabang Papua tahun 1990",
    "Kamu bisa bantu apa?",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">BI Chatbot Demo</h1>
            <p className="text-sm text-slate-500 mt-1">
              Chat biasa, permintaan data, dan chart dalam satu tampilan.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => runPrompt(prompt)}
                className="mr-2 mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-4 h-[520px] overflow-y-auto rounded-2xl bg-slate-50 p-4 border border-slate-200">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl bg-slate-100 text-slate-500 px-4 py-3 text-sm">
                  Sedang memproses...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan atau chat biasa..."
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Proses..." : "Kirim"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}