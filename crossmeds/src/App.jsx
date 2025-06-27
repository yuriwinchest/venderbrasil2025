import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MedicamentosPage from './pages/MedicamentosPage'
import InteracoesPage from './pages/InteracoesPage'
import PerfilPage from './pages/PerfilPage'
import RelatorioPage from './pages/RelatorioPage'
import { MedicamentosProvider } from './context/MedicamentosContext'

function App() {
  return (
    <MedicamentosProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/medicamentos" element={<MedicamentosPage />} />
          <Route path="/interacoes" element={<InteracoesPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/relatorio" element={<RelatorioPage />} />
        </Routes>
      </BrowserRouter>
    </MedicamentosProvider>
  )
}

export default App