import React, { useState, useEffect } from 'react';
import '../css/WordleGame.css';

const WordleGame = () => {
  const SECRET_WORD = "PROM?";
  const MAX_ATTEMPTS = 6;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "won", "lost"
  const [message, setMessage] = useState("Try to guess the 5-character word!");
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [validWordsCache, setValidWordsCache] = useState(new Set(["PROM?"])); // Initialize with our special word
  const [hintShown, setHintShown] = useState(false);
  
  // Load valid words on component mount
  useEffect(() => {
    fetchValidWords();
  }, []);
  
  
  const fetchValidWords = async () => {
    setIsLoading(true);
    try {
      // Using the Free Dictionary API as an example
      // In a production app, you'd want to use a more specific word list API or your own backend
      const response = await fetch('https://api.datamuse.com/words?sp=?????&max=1000');
      if (!response.ok) throw new Error('Failed to fetch word list');
      
      const data = await response.json();
      const wordSet = new Set(["PROM?"]); // Always include our special word
      
      // Add fetched words to our set (converting to uppercase)
      data.forEach(wordObj => {
        const word = wordObj.word.toUpperCase();
        if (word.length === 5) {
          wordSet.add(word);
        }
      });
      
      setValidWordsCache(wordSet);
    } catch (error) {
      console.error('Error fetching word list:', error);
      // Fallback to a small list of common words if API fails
      const fallbackWords = [
        "APPLE", "ABOUT", "BEACH", "BRAVE", "CHAIR", "DANCE", "DREAM", 
        "EARTH", "FLAME", "GHOST", "HEART", "HOUSE", "KNIFE", "LEMON", 
        "LIGHT", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PAPER", "PLANT", 
        "QUICK", "RADIO", "RIVER", "SNAKE", "SPACE", "TABLE", "WATER", 
        "WORLD", "PROM?"
      ];
      setValidWordsCache(new Set(fallbackWords));
      setMessage("Using limited word list - API connection failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (key) => {
    if (gameStatus === "won" || isLoading) return;
    
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "DELETE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };
  
  const isValidWord = async (word) => {
    // Special case for "PROM?"
    if (word === "PROM?") return true;
    
    // Check if it's a valid 5-letter word (no special characters)
    if (word.length !== 5) return false;
    if (word.includes("?")) return false;
    
    // First check our local cache
    if (validWordsCache.has(word)) return true;
    
    // If not in cache, check with the API
    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`);
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const isValid = data.length > 0 && data[0].word.toUpperCase() === word;
      
      // If valid, add to our cache for future checks
      if (isValid) {
        setValidWordsCache(prev => new Set([...prev, word]));
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating word:', error);
      // If API check fails, fallback to cache-only validation
      return validWordsCache.has(word);
    }
  };
  
  const submitGuess = async () => {
    // Check if guess is complete
    if (currentGuess.length !== 5) {
      setMessage("Your guess must be 5 characters long!");
      return;
    }
    
    // Start validation - temporarily disable input
    setIsLoading(true);
    
    // Check if it's a valid word (or PROM?)
    const valid = await isValidWord(currentGuess);
    
    if (!valid) {
      setMessage("Not a valid word! Try another 5-letter word.");
      setIsLoading(false);
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
      setMessage(`Keep trying! The word has not been guessed after ${MAX_ATTEMPTS} attempts.`);
    } else if (newGuesses.length === 4) {
      // Show hint after 4th attempt (i.e., on the 5th attempt)
      setMessage("Hint: Have you tried using the ? key? Some special words might need it!");
      setHintShown(true);
    } else {
      setMessage("Keep guessing!");
    }
    setCurrentGuess("");
    setIsLoading(false);
  };
  
  const getLetterStatus = (letter, position) => {
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
                // Add hint class if we're showing the hint
                if (hintShown && guesses.length === 4) {
                  keyClass += " keyboard-key-hint";
                }
              } else if (keyboardStatus[key] === "correct") {
                keyClass += " keyboard-key-correct";
              } else if (keyboardStatus[key] === "present") {
                keyClass += " keyboard-key-present";
              } else if (keyboardStatus[key] === "absent") {
                keyClass += " keyboard-key-absent";
              }
              
              if (isLoading) {
                keyClass += " keyboard-key-disabled";
              }
              
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={keyClass}
                  disabled={isLoading}
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
      <p className="game-message">
        {isLoading && guesses.length === 0 ? "Loading word list..." : message}
      </p>
      
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
