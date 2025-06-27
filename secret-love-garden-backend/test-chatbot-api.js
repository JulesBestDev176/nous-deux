(async () => {
  const fetch = (await import('node-fetch')).default;

  // Utilise le backend local pour le test
  const API_URL = 'http://localhost:5000/api/chatbot/chat';

  // Token JWT utilisateur fourni
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NTVkYTkyZDg4OTZmMDk2N2JkZDBmOSIsImlhdCI6MTc1MDY4NTYzMiwiZXhwIjoxNzUzMjc3NjMyfQ.qpEEgHXImO3Hgo8O74NPe0Q2K8CAqxTkBUy3Z5oZjqA';

  const message = "Comment puis-je surprendre mon partenaire ce week-end ?";
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  console.log('Réponse du chatbot :\n', data.response);
  if (data.suggestions) {
    console.log('\nSuggestions :');
    data.suggestions.forEach(s => console.log('•', s));
  }
  if (data.analysis) {
    console.log('\nAnalyse :', data.analysis);
  }
})(); 