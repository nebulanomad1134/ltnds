import React, { useState, useRef, useEffect } from 'react';
import './styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';
import products from '../../../containers/Homepage/products.json';
// import products from '../products.json';

// client\app\containers\Homepage\products.json

const GEMINI_API_KEY = 'AIzaSyC1D5-MKD0Et9tRDx1INRyGJ22XBfRLZw8';
const API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const ChatWithAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const searchProducts = async query => {
    const searchTerms = query.toLowerCase().split(' ');

    // First try to match product names
    let matchedProducts = products.filter(product => {
      const productName = product.name.toLowerCase();
      return searchTerms.some(term => productName.includes(term));
    });

    // If no name matches, try description
    if (matchedProducts.length === 0) {
      matchedProducts = products.filter(product => {
        const searchText = product.description.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
      });
    }

    // Limit results to most relevant
    return matchedProducts.slice(0, 3);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const matchedProducts = await searchProducts(inputMessage);

      const prompt = `
                You are a helpful shopping assistant. 
                
                User message: "${inputMessage}"
    
                ${
                  matchedProducts.length > 0
                    ? `
                Available products that match the query:
                ${matchedProducts
                  .map(
                    p =>
                      `Product: ${p.name}
                     Price: $${p.price}
                     Details: ${p.description}`
                  )
                  .join('\n\n')}
                `
                    : ''
                }
    
                Instructions:
                1. If greeting (hi/hello), respond naturally without product suggestions
                2. If asking about products, list them clearly with prices
                3. Keep responses conversational and brief
                4. Don't use markdown formatting (* or **)
                5. Format product suggestions as:
                   "Product Name - $price
                    Key features in plain text"
                6. No follow-up questions
            `;

      const response = await fetch(`${API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

      // Only include products if they were specifically asked about
      const shouldShowProducts =
        inputMessage.toLowerCase().includes('shirt') ||
        inputMessage.toLowerCase().includes('product') ||
        inputMessage.toLowerCase().includes('buy');

      setMessages(prev => [
        ...prev,
        {
          text: aiResponse,
          sender: 'ai',
          products: shouldShowProducts ? matchedProducts : null,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          text: "I apologize, but I couldn't understand that. How can I help you?",
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, index) => (
    <div key={index} className={`message ${message.sender}`}>
      {message.sender === 'ai' && (
        <div className='bot-avatar'>
          <i className='fas fa-robot'></i>
        </div>
      )}
      <div className='message-bubble'>
        <div className='message-text'>{message.text}</div>
        {message.products && message.products.length > 0 && (
          <div className='product-suggestions'>
            {message.products.map((product, idx) => (
              <Link
                key={idx}
                to={`/product/${product.slug}`}
                className='product-card'
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className='product-image'
                />
                <div className='product-details'>
                  <h5>{product.name}</h5>
                  <p>${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className='message-time'>
          {message.timestamp?.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className='chat-widget'>
      <div className='button-wrapper'>
        <button
          className={`chat-toggle-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'}`}></i>
          <span className='tooltip'>Chat with AI Assistant</span>
        </button>
      </div>

      {isOpen && (
        <div className='chat-popup'>
          <div className='chat-header'>
            <div className='header-content'>
              <i className='fas fa-robot'></i>
              <h4>AI Assistant</h4>
            </div>
            <button className='close-button' onClick={() => setIsOpen(false)}>
              <i className='fas fa-times'></i>
            </button>
          </div>
          <div className='chat-container'>
            <div className='messages-container'>
              {messages.length === 0 && (
                <div className='welcome-message'>
                  <div className='welcome-icon'>
                    <i className='fas fa-robot'></i>
                  </div>
                  <p>
                    Hello! I can help you find products. What are you looking
                    for?
                  </p>
                </div>
              )}
              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && (
                <div className='message ai'>
                  <div className='bot-avatar'>
                    <i className='fas fa-robot'></i>
                  </div>
                  <div className='typing-indicator'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className='input-container'>
              <input
                type='text'
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder='Type your message...'
                disabled={isLoading}
              />
              <button
                type='submit'
                className={`send-button ${
                  isLoading || !inputMessage.trim() ? 'disabled' : ''
                }`}
                disabled={isLoading || !inputMessage.trim()}
              >
                <i className='fas fa-paper-plane'></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatWithAI;
