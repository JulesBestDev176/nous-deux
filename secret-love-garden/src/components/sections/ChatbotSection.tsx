import { useState } from "react";

// Exemple d'API (à adapter selon l'emplacement réel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const chatbotAPI = {
  async sendMessage(message: string) {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });
    return response.json();
  },
  async getAnalysis() {
    const response = await fetch(`${API_BASE_URL}/chatbot/analysis`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },
  async getSuggestions() {
    const response = await fetch(`${API_BASE_URL}/chatbot/suggestions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};

const ChatbotSection = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    try {
      const result = await chatbotAPI.sendMessage(input);
      setMessages((msgs) => [...msgs, { role: "bot", content: result.response }]);
      setSuggestions(result.suggestions || []);
      setAnalysis(result.analysis || null);
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "bot", content: "Erreur lors de la communication avec le chatbot." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-pink-600">Chatbot Conseiller</h2>
      <div className="bg-white rounded-lg border border-pink-200 p-4 mb-4 h-80 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 && <div className="text-gray-400">Posez une question à votre conseiller virtuel !</div>}
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={msg.role === "user" ? "bg-pink-100 text-pink-800 px-3 py-2 rounded-lg inline-block" : "bg-purple-100 text-purple-800 px-3 py-2 rounded-lg inline-block"}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          type="text"
          placeholder="Votre question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Envoyer
        </button>
      </div>
      {loading && <div className="text-pink-500 mb-2">Le conseiller réfléchit...</div>}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-purple-700 mb-2">Suggestions d'activités :</h3>
          <ul className="list-disc list-inside text-purple-800">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {analysis && (
        <div className="mb-4">
          <h3 className="font-semibold text-blue-700 mb-2">Analyse du couple :</h3>
          <div className="text-blue-800 text-sm whitespace-pre-line">
            Communication : {analysis.communicationScore}/10<br />
            Activités : {analysis.activityScore}/10<br />
            Engagement : {analysis.engagementScore}/10<br />
            <span className="font-semibold">Forces :</span> {analysis.strengths?.join(', ') || 'Aucune'}<br />
            <span className="font-semibold">Problèmes :</span> {analysis.issues?.join(', ') || 'Aucun'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotSection; 