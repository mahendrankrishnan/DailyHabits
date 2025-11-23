import { useState, useRef, useEffect } from 'react';
import { askAI } from '../../services/apiServices';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  onClose: () => void;
}

function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for your habits tracker. Ask me anything about your habits, like 'What habits do I have?', 'Which habit has the best completion rate?', or 'Give me suggestions to improve my habits'."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askAI(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error: any) {
      let errorMessage = 'Failed to get response from AI.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.error || errorData.details || errorMessage;
        if (errorData.hint) {
          errorMessage += `\n\nHint: ${errorData.hint}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${errorMessage}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <h3>🤖 AI Assistant</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="ai-chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="ai-chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your habits..."
          className="ai-chat-input"
          disabled={loading}
        />
        <button type="submit" className="ai-chat-send-btn" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default AIChat;

