// Base completa de medicamentos ANVISA (25.700+) - Implementação com dados reais
// Para idosos: autocompletar inteligente e informações completas

import { medicamentosANVISA } from './medicamentosDB.js';

// Dados do CSV de medicamentos fornecido pelo usuário
export const medicamentosCSV = [
  {
    id: 1,
    substancia: "21-ACETATO DE DEXAMETASONA;CLOTRIMAZOL",
    laboratorio: "BAYER S.A.",
    produto: "BAYCUTEN N",
    apresentacao: "10 MG/G + 0,443 MG/G CREM DERM CT BG AL X 40 G",
    classeTerapeutica: "D7B2 - CORTICOESTERÓIDES ASSOCIADOS A ANTIMICOTICOS",
    tarja: "- (*)",
    patologias: ["Dermatite", "Micose", "Inflamação da pele"],
    modoTomar: "Aplicar na pele",
    observacao: "Uso tópico apenas"
  },
  {
    id: 2,
    substancia: "ABATACEPTE",
    laboratorio: "BRISTOL-MYERS SQUIBB FARMACÊUTICA LTDA",
    produto: "ORENCIA",
    apresentacao: "250 MG PO LIOF SOL INJ CT 1 FA + SER DESCARTÁVEL",
    classeTerapeutica: "M1C - AGENTES ANTI-REUMÁTICOS ESPECÍFICOS",
    tarja: "Tarja Vermelha",
    patologias: ["Artrite reumatoide", "Artrite psoriásica"],
    modoTomar: "Injeção hospitalar",
    observacao: "Uso restrito hospitalar"
  },
  {
    id: 3,
    substancia: "ACEBROFILINA",
    laboratorio: "ACHE LABORATORIOS FARMACEUTICOS SA",
    produto: "MELYSSE",
    apresentacao: "10 MG/ML XPE CT FR PLAS AMB X 120 ML + COP X 10 ML",
    classeTerapeutica: "R5C - EXPECTORANTES",
    tarja: "Tarja Vermelha",
    patologias: ["Bronquite", "Asma", "DPOC", "Tosse com catarro"],
    modoTomar: "Com alimentos",
    observacao: "Mucolítico e expectorante"
  },
  {
    id: 4,
    substancia: "ACECLOFENACO",
    laboratorio: "EUROFARMA LABORATORIOS S.A.",
    produto: "PROFLAM",
    apresentacao: "100 MG COM REV CT BL AL/AL X 12",
    classeTerapeutica: "M1A1 - ANTIRREUMÁTICOS NÃO ESTEROIDAIS PUROS",
    tarja: "- (*)",
    patologias: ["Artrite", "Dor muscular", "Inflamação", "Dor nas juntas"],
    modoTomar: "Com refeição",
    observacao: "Anti-inflamatório não esteroidal"
  },
  {
    id: 5,
    substancia: "CAPTOPRIL",
    laboratorio: "MEDLEY S.A. INDÚSTRIA FARMACÊUTICA",
    produto: "CAPOTEN",
    apresentacao: "25 MG COM CT BL AL AL X 30",
    classeTerapeutica: "C9A1 - INIBIDORES DA ECA",
    tarja: "Tarja Vermelha",
    patologias: ["Hipertensão arterial", "Insuficiência cardíaca", "Pressão alta"],
    modoTomar: "Em jejum (1h antes ou 2h após refeições)",
    observacao: "Absorção reduzida com alimentos"
  }
];

// Combinar bases de dados
export const medicamentosCompletos = [...medicamentosANVISA, ...medicamentosCSV];

// Autocompletar inteligente para idosos
export const autocompletarMedicamento = (termo) => {
  if (!termo || termo.length < 1) return [];
  
  const termoLower = termo.toLowerCase();
  const resultados = [];
  
  // Busca priorizada para idosos
  medicamentosCompletos.forEach(med => {
    let score = 0;
    let match = false;
    
    // Prioridade 1: Nome comercial (mais familiar para idosos)
    if (med.produto.toLowerCase().includes(termoLower)) {
      score += 100;
      match = true;
    }
    
    // Prioridade 2: Início do nome comercial
    if (med.produto.toLowerCase().startsWith(termoLower)) {
      score += 50;
      match = true;
    }
    
    // Prioridade 3: Princípio ativo
    if (med.substancia.toLowerCase().includes(termoLower)) {
      score += 30;
      match = true;
    }
    
    // Prioridade 4: Classe terapêutica
    if (med.classeTerapeutica.toLowerCase().includes(termoLower)) {
      score += 20;
      match = true;
    }
    
    // Prioridade 5: Laboratório
    if (med.laboratorio.toLowerCase().includes(termoLower)) {
      score += 10;
      match = true;
    }
    
    if (match) {
      resultados.push({ ...med, score });
    }
  });
  
  // Ordenar por relevância e retornar top 15 para não sobrecarregar idosos
  return resultados
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
};

// Obter dosagem sugerida da apresentação
export const extrairDosagemSugerida = (apresentacao) => {
  if (!apresentacao) return '';
  
  // Padrões comuns de dosagem
  const padroes = [
    /(\d+\s*MG)/i,
    /(\d+\s*MCG)/i,
    /(\d+\s*G)/i,
    /(\d+\s*ML)/i,
    /(\d+\s*%)/i
  ];
  
  for (const padrao of padroes) {
    const match = apresentacao.match(padrao);
    if (match) {
      return match[1];
    }
  }
  
  return '';
};

// Obter frequências comuns para idosos
export const frequenciasComuns = [
  "1x ao dia (manhã)",
  "1x ao dia (noite)",
  "2x ao dia (manhã e noite)",
  "3x ao dia (manhã, tarde e noite)",
  "De 8 em 8 horas",
  "De 12 em 12 horas",
  "Quando necessário",
  "1x por semana",
  "Em jejum",
  "Após as refeições"
];

// Horários sugeridos para idosos
export const horariosSugeridos = {
  "1x ao dia (manhã)": ["08:00"],
  "1x ao dia (noite)": ["20:00"],
  "2x ao dia (manhã e noite)": ["08:00", "20:00"],
  "3x ao dia (manhã, tarde e noite)": ["08:00", "14:00", "20:00"],
  "De 8 em 8 horas": ["08:00", "16:00", "00:00"],
  "De 12 em 12 horas": ["08:00", "20:00"],
  "Em jejum": ["07:00"],
  "Após as refeições": ["08:30", "12:30", "19:30"]
};

// DRY: Função para obter todas as patologias
export const obterTodasPatologias = (medicamentos) => {
  const todasPatologias = medicamentos.flatMap(med => med.patologias || []);
  return [...new Set(todasPatologias)].sort();
};

// Função para detectar interações entre medicamentos
export const detectarInteracoesMedicamentosas = (medicamentos) => {
  const interacoes = [];
  
  // Base simplificada de interações conhecidas para idosos
  const interacoesConhecidas = {
    'ÁCIDO ACETILSALICÍLICO': {
      'CLORIDRATO DE FLUOXETINA': {
        nivel: 'moderado',
        descricao: 'Risco aumentado de sangramento gastrointestinal',
        recomendacao: 'Monitorar sinais de sangramento. Tomar com 2h de diferença.'
      },
      'SINVASTATINA': {
        nivel: 'leve',
        descricao: 'Possível aumento do risco de miopatia',
        recomendacao: 'Monitorar dores musculares.'
      }
    },
    'CLORIDRATO DE METFORMINA': {
      'CAPTOPRIL': {
        nivel: 'leve',
        descricao: 'Possível potencialização do efeito hipoglicemiante',
        recomendacao: 'Monitorar glicemia com mais frequência.'
      }
    },
    'OMEPRAZOL': {
      'LEVOTIROXINA SÓDICA': {
        nivel: 'moderado',
        descricao: 'Redução significativa da absorção da levotiroxina',
        recomendacao: 'Tomar levotiroxina 4h antes do omeprazol.'
      }
    }
  };

  for (let i = 0; i < medicamentos.length; i++) {
    for (let j = i + 1; j < medicamentos.length; j++) {
      const med1 = medicamentos[i];
      const med2 = medicamentos[j];
      
      const interacao1 = interacoesConhecidas[med1.substancia]?.[med2.substancia];
      const interacao2 = interacoesConhecidas[med2.substancia]?.[med1.substancia];
      
      if (interacao1 || interacao2) {
        const interacao = interacao1 || interacao2;
        interacoes.push({
          medicamento1: med1,
          medicamento2: med2,
          ...interacao
        });
      }
    }
  }
  
  return interacoes;
};

export default medicamentosCompletos;