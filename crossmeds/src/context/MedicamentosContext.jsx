import React, { createContext, useContext, useState, useEffect } from 'react';

const MedicamentosContext = createContext();

export const useMedicamentos = () => {
  const context = useContext(MedicamentosContext);
  if (!context) {
    throw new Error('useMedicamentos deve ser usado dentro de MedicamentosProvider');
  }
  return context;
};

export const MedicamentosProvider = ({ children }) => {
  const [medicamentosUsuario, setMedicamentosUsuario] = useState([]);
  const [perfilPaciente, setPerfilPaciente] = useState({
    nome: '',
    idade: '',
    peso: '',
    altura: '',
    glicose: '',
    pressao: '',
    colesterol: '',
    alergias: '',
    observacoes: ''
  });

  useEffect(() => {
    const savedMedicamentos = localStorage.getItem('crossmeds-medicamentos');
    const savedPerfil = localStorage.getItem('crossmeds-perfil');
    
    if (savedMedicamentos) {
      setMedicamentosUsuario(JSON.parse(savedMedicamentos));
    }
    
    if (savedPerfil) {
      setPerfilPaciente(JSON.parse(savedPerfil));
    }
  }, []);

  const adicionarMedicamento = (medicamento) => {
    const novoMedicamento = {
      ...medicamento,
      id: Date.now(),
      dataAdicao: new Date().toISOString(),
      ativo: true
    };
    
    const novosLista = [...medicamentosUsuario, novoMedicamento];
    setMedicamentosUsuario(novosLista);
    localStorage.setItem('crossmeds-medicamentos', JSON.stringify(novosLista));
  };

  const removerMedicamento = (id) => {
    const novosLista = medicamentosUsuario.filter(med => med.id !== id);
    setMedicamentosUsuario(novosLista);
    localStorage.setItem('crossmeds-medicamentos', JSON.stringify(novosLista));
  };

  const atualizarPerfil = (novosDados) => {
    const perfilAtualizado = { ...perfilPaciente, ...novosDados };
    setPerfilPaciente(perfilAtualizado);
    localStorage.setItem('crossmeds-perfil', JSON.stringify(perfilAtualizado));
  };

  const calcularIMC = () => {
    const peso = parseFloat(perfilPaciente.peso);
    const altura = parseFloat(perfilPaciente.altura);
    
    if (peso && altura) {
      const imc = peso / (altura * altura);
      return imc.toFixed(1);
    }
    return null;
  };

  const calcularHbA1c = () => {
    const glicose = parseFloat(perfilPaciente.glicose);
    
    if (glicose) {
      const hba1c = (glicose + 46.7) / 28.7;
      return hba1c.toFixed(1);
    }
    return null;
  };

  const value = {
    medicamentosUsuario,
    perfilPaciente,
    adicionarMedicamento,
    removerMedicamento,
    atualizarPerfil,
    calcularIMC,
    calcularHbA1c
  };

  return (
    <MedicamentosContext.Provider value={value}>
      {children}
    </MedicamentosContext.Provider>
  );
};