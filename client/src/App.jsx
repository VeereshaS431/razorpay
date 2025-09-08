import './App.css'
import Chat from './Pages/chat'
import Login from './Pages/Login/login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PushNotification from './Pages/pushNotification/pushNotification'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
      <PushNotification />
    </>

  )
}

export default App
