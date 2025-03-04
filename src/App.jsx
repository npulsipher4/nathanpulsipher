import { Routes, Route } from "react-router-dom"
import Wordle from "./pages/Wordle"
import Home from "./pages/Home"
import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/wordle" element={<Wordle />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
