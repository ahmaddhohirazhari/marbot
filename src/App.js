import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Style components using Tailwind CSS
import "./App.css";
import ChatHistory from "./component/ChatHistory";
import Loading from "./component/Loading";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // inislize your Gemeni Api
  const genAI = new GoogleGenerativeAI(
    "AIzaSyCZ4gWGqacrmMx3Z54rTkNn1ABbZRzQ_04"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Function to handle user input
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Function to send user message to Gemini
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      // call Gemini Api to get a response
      const result = await model.generateContent(userInput);
      const response = await result.response;
      console.log(response);
      // add Gemeni's response to the chat history
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response.text() },
      ]);
    } catch {
      console.error("Error sending message");
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([]);
  };

  return (
   <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
  <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#66bb6a]">Marbot</h1>

  <div className="chat-container rounded-lg shadow-md p-4 bg-white mb-4 h-[60vh] overflow-y-auto">
    <ChatHistory chatHistory={chatHistory} />
    <Loading isLoading={isLoading} />
  </div>

  <div className="flex flex-col sm:flex-row gap-2 mt-4">
    <input
      type="text"
      className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
      placeholder="Type your message..."
      value={userInput}
      onChange={handleUserInput}
      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
    />
    <div className="flex gap-2">
      <button
        className="px-4 py-2 rounded-lg bg-[#66bb6a] text-white hover:bg-[#4caf50] focus:outline-none transition-colors flex-1"
        onClick={sendMessage}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 focus:outline-none transition-colors"
        onClick={clearChat}
      >
        Clear
      </button>
    </div>
  </div>
</div>
  );
};

export default App;
