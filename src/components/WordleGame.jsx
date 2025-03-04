import React, { useState } from 'react';
import '../css/WordleGame.css';

const WordleGame = () => {
  const SECRET_WORD = "PROM?";
  const MAX_ATTEMPTS = 6;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "won", "lost"
  const [message, setMessage] = useState("Try to guess the 5-character word!");
  const [keyboardStatus, setKeyboardStatus] = useState({});
  
  const handleKeyPress = (key) => {
    if (gameStatus === "won") return;
    
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "DELETE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };
  
  const submitGuess = () => {
    // Validate the guess
    if (currentGuess.length !== 5) {
      setMessage("Your guess must be 5 characters long!");
      return;
    }
    
    // Check if it's a valid format (4 letters + ? or 5 letters)
    const isValidFormat = 
      (currentGuess.length === 5 && currentGuess[4] === '?') || 
      (currentGuess.length === 5);
    
    if (!isValidFormat) {
      setMessage("Invalid format! Use a 5-letter word or 4 letters with a ? at the end");
      return;
    }
    
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    // Update keyboard status
    const newKeyboardStatus = {...keyboardStatus};
    
    for (let i = 0; i < currentGuess.length; i++) {
      const char = currentGuess[i];
      
      if (char === SECRET_WORD[i]) {
        newKeyboardStatus[char] = "correct";
      } else if (SECRET_WORD.includes(char) && newKeyboardStatus[char] !== "correct") {
        newKeyboardStatus[char] = "present";
      } else if (!newKeyboardStatus[char]) {
        newKeyboardStatus[char] = "absent";
      }
    }
    
    setKeyboardStatus(newKeyboardStatus);
    
    // Check if the guess is correct
    if (currentGuess === SECRET_WORD) {
      setGameStatus("won");
      setMessage("Congratulations! You've guessed the word!");
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      // For this version, we don't end the game after 6 attempts
      setMessage(`Keep trying! The word has not been guessed after 6 attempts.`);
    }
    
    setCurrentGuess("");
  };
  
  const getLetterStatus = (letter, position, word) => {
    if (letter === SECRET_WORD[position]) {
      return "correct";
    } else if (SECRET_WORD.includes(letter)) {
      return "present";
    } else {
      return "absent";
    }
  };
  
  const renderKeyboard = () => {
    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "?"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"]
    ];
    
    return (
      <div className="keyboard">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map(key => {
              let keyClass = "keyboard-key";
              
              if (key === "ENTER" || key === "DELETE") {
                keyClass += " keyboard-key-wide";
              }
              
              if (key === "?") {
                keyClass += " keyboard-key-question";
              } else if (keyboardStatus[key] === "correct") {
                keyClass += " keyboard-key-correct";
              } else if (keyboardStatus[key] === "present") {
                keyClass += " keyboard-key-present";
              } else if (keyboardStatus[key] === "absent") {
                keyClass += " keyboard-key-absent";
              }
              
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={keyClass}
                >
                  {key === "DELETE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="game-container">
      <h1 className="game-title">Wordle Game</h1>
      <p className="game-message">{message}</p>
      
      {/* Grid */}
      <div className="game-grid">
        {Array(Math.max(6, guesses.length + 1)).fill(0).map((_, rowIndex) => {
          // If we have a guess for this row
          if (rowIndex < guesses.length) {
            return Array(5).fill(0).map((_, colIndex) => {
              const letterStatus = getLetterStatus(guesses[rowIndex][colIndex], colIndex, guesses[rowIndex]);
              const cellClass = `grid-cell grid-cell-${letterStatus}`;
              
              return (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={cellClass}
                >
                  {guesses[rowIndex][colIndex]}
                </div>
              );
            });
          } 
          // Current guess row
          else if (rowIndex === guesses.length) {
            return Array(5).fill(0).map((_, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className="grid-cell grid-cell-current"
              >
                {currentGuess[colIndex] || ""}
              </div>
            ));
          }
          // Empty future rows
          else {
            return Array(5).fill(0).map((_, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className="grid-cell grid-cell-empty"
              ></div>
            ));
          }
        })}
      </div>
      
      {/* Keyboard */}
      {renderKeyboard()}
      
      {gameStatus === "won" && (
        <div className="victory-message">
          <p>You won! 🎉</p>
          <p>You guessed the secret word: {SECRET_WORD}</p>
        </div>
      )}
    </div>
  );
};

export default WordleGame;
