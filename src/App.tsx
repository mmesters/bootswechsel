import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { LotterySlipsPage } from './pages/LotterySlipsPage'

// HashRouter, not BrowserRouter: GitHub Pages has no server-side rewrite, so a
// direct load or refresh of e.g. /lottery-slips would 404 with history-based routing.
function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lottery-slips" element={<LotterySlipsPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}

export default App
