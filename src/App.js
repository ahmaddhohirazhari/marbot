import React, { useState, useEffect } from 'react';
import { Send, Trash2, User } from 'lucide-react';

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lily's profile
  const lilyProfile = {
    name: 'Lily',
    avatar: '👩‍💻',
    status: 'Online',
    description:
      'Halo! Saya Lily, asisten AI yang ramah dan siap membantu Anda kapan saja! 😊',
  };

  // Gemini AI Configuration (untuk implementasi di environment Anda)
  const GEMINI_API_KEY = 'AIzaSyCZ4gWGqacrmMx3Z54rTkNn1ABbZRzQ_04'; // Ganti dengan API key Anda
  const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  // Function to call Gemini API using fetch
  const callGeminiAPI = async (prompt) => {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Kamu adalah Lily, seorang asisten AI wanita muda yang sangat ramah, ceria, dan membantu. 
          
Karakteristik kepribadianmu:
- Selalu gunakan bahasa Indonesia yang hangat dan friendly
- Gunakan emoji yang sesuai untuk mengekspresikan emosi 😊
- Bersikap seperti teman yang baik dan pengertian
- Berikan jawaban yang informatif tapi tetap mudah dipahami
- Selalu positif dan mendukung
- Jika tidak tahu jawaban, jujur mengakuinya dengan ramah
- Gunakan sapaan yang hangat dan personal

Gaya bicara:
- Hindari bahasa yang terlalu formal
- Gunakan kata-kata seperti "aku", "kamu" untuk terkesan lebih dekat
- Sesekali gunakan bahasa gaul yang sopan
- Selalu akhiri dengan pertanyaan atau ajakan untuk berinteraksi lebih lanjut

Pesan dari user: ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  // Function to send message
  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    setIsLoading(true);

    try {
      // Add user message immediately
      const newUserMessage = {
        type: 'user',
        message: userInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, newUserMessage]);

      // Store current input and clear input field
      const currentInput = userInput;
      setUserInput('');

      // Call Gemini API
      const responseText = await callGeminiAPI(currentInput);

      // Add Lily's response to chat history
      const botMessage = {
        type: 'bot',
        message: responseText,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Handle different types of errors
      let errorMessage = 'Maaf, terjadi kesalahan. Coba lagi ya! 😅';

      if (error.message?.includes('401')) {
        errorMessage =
          'Ups! API key tidak valid. Cek konfigurasi API key ya! 🔧';
      } else if (error.message?.includes('429')) {
        errorMessage =
          'Wah, terlalu banyak request nih. Tunggu sebentar ya! ⏰';
      } else if (error.message?.includes('403')) {
        errorMessage =
          'API key tidak memiliki akses. Cek pengaturan API key ya! 🔐';
      } else if (error.message?.includes('network') || !navigator.onLine) {
        errorMessage =
          'Koneksi internet bermasalah nih. Cek koneksi kamu dulu ya! 🌐';
      }

      const errorMsg = {
        type: 'bot',
        message: errorMessage,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ChatMessage = ({ message }) => {
    const isUser = message.type === 'user';

    return (
      <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
              {lilyProfile.avatar}
            </div>
          </div>
        )}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-green-600 text-white rounded-br-none'
              : 'bg-gray-700 text-white rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.message}</p>
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-green-200' : 'text-gray-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
        {isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              <User size={16} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
          {lilyProfile.avatar}
        </div>
      </div>
      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg rounded-bl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg mr-3">
            {lilyProfile.avatar}
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{lilyProfile.name}</h1>
            <p className="text-green-400 text-sm">{lilyProfile.status}</p>
          </div>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Clear chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-900 max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        {chatHistory.length === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl mx-auto mb-4">
              {lilyProfile.avatar}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Halo! Saya {lilyProfile.name}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-4">
              {lilyProfile.description}
            </p>
            <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-2">
                💡 <strong>Tips:</strong>
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>
                  • Tanya apa saja tentang teknologi, coding, atau hal umum
                </li>
                <li>• Minta bantuan untuk menyelesaikan masalah</li>
                <li>• Chat santai untuk mengobrol</li>
                <li>• Lily akan menjawab dengan ramah dan membantu! 😊</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-900 bg-opacity-50 rounded text-xs text-yellow-300">
                <strong>⚠️ Catatan:</strong> Untuk menggunakan Gemini AI,
                pastikan API key sudah dikonfigurasi dengan benar di environment
                Anda.
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {chatHistory.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input Area - Fixed */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex-shrink-0 sticky bottom-0 z-10">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-full border border-gray-600 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-400"
            placeholder="Ketik pesan..."
            value={userInput}
            onChange={handleUserInput}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || userInput.trim() === ''}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors min-w-[48px] h-[48px] flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
