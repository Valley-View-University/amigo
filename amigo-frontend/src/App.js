import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your backend server URL

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [drawings, setDrawings] = useState([]);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    // Listen for chat messages from the server
    socket.on('chat message', (message) => {
      setMessages([...messages, message]);
    });

    // Listen for drawing updates from the server
    socket.on('drawing', (data) => {
      setDrawings([...drawings, data]);
    });

    return () => {
      // Clean up socket connections on component unmount
      socket.disconnect();
    };
  }, [messages, drawings]);

  const sendMessage = () => {
    if (messageInput.trim() !== '') {
      // Send chat message to the server
      socket.emit('chat message', messageInput);
      setMessageInput('');
    }
  };

  const handleMouseDown = (e) => {
    // Start drawing on the whiteboard
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    const drawingData = { x: offsetX, y: offsetY, color: 'black', drawing: [] };
    setDrawings([...drawings, drawingData]);
  };

  const handleMouseMove = (e) => {
    // Continue drawing on the whiteboard
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const updatedDrawings = [...drawings];
    const currentDrawing = updatedDrawings[updatedDrawings.length - 1];
    currentDrawing.drawing.push({ x: offsetX, y: offsetY });
    setDrawings(updatedDrawings);
    socket.emit('drawing', currentDrawing);
  };

  const handleMouseUp = () => {
    // Stop drawing on the whiteboard
    setDrawing(false);
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat">
          <h2>Study Room Chat</h2>
          <ul>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
          <div className="message-input">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
        <div className="whiteboard-container">
          <h2>Shared Whiteboard</h2>
          <div
            className="whiteboard"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {drawings.map((data, index) => (
              <Drawing key={index} data={data} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Drawing = ({ data }) => {
  return (
    <div className="drawing">
      {data.drawing.map((point, index) => (
        <div
          key={index}
          className="dot"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            background: data.color,
          }}
        ></div>
      ))}
    </div>
  );
};

export default App;
