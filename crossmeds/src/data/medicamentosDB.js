// Base de dados com medicamentos reais da ANVISA (implementação base dos 25.700)
// Dados adaptados para idosos com informações claras e práticas
export const medicamentosANVISA = [
  {
    id: 1,
    substancia: "ÁCIDO ACETILSALICÍLICO",
    laboratorio: "BAYER S.A.",
    produto: "ASPIRINA",
    apresentacao: "100 MG COM REV CT BL AL AL X 20",
    classeTerapeutica: "B1A - ANTIAGREGANTES PLAQUETÁRIOS",
    tarja: "- (*)",
    patologias: ["Prevenção cardiovascular", "Anticoagulação", "Dor", "Inflamação"],
    modoTomar: "Com refeição",
    observacao: "Evitar em jejum para evitar irritação gástrica"
  },
  {
    id: 2,
    substancia: "CLORIDRATO DE METFORMINA",
    laboratorio: "MERCK S/A",
    produto: "GLIFAGE",
    apresentacao: "500 MG COM REV CT BL AL AL X 30",
    classeTerapeutica: "A10E - ANTIDIABÉTICOS BIGUANIDAS",
    tarja: "- (*)",
    patologias: ["Diabetes tipo 2", "Resistência à insulina", "Síndrome metabólica"],
    modoTomar: "Durante ou após a refeição principal",
    observacao: "Reduz efeitos colaterais gastrointestinais"
  },
  {
    id: 3,
    substancia: "LEVOTIROXINA SÓDICA",
    laboratorio: "SANOFI-AVENTIS FARMACÊUTICA LTDA",
    produto: "PURAN T4",
    apresentacao: "50 MCG COM CT BL AL AL X 30",
    classeTerapeutica: "H3A1 - HORMÔNIOS TIREOIDIANOS",
    tarja: "- (*)",
    patologias: ["Hipotireoidismo", "Disfunção tireoidiana"],
    modoTomar: "Jejum, 30-60 minutos antes do café da manhã",
    observacao: "Evitar com cálcio, ferro ou leite"
  },
  {
    id: 4,
    substancia: "OMEPRAZOL",
    laboratorio: "ASTRAZENECA DO BRASIL LTDA",
    produto: "LOSEC",
    apresentacao: "20 MG CAP DURA ENT CT BL AL AL X 14",
    classeTerapeutica: "A2B3 - INIBIDORES DA BOMBA DE PRÓTONS",
    tarja: "- (*)",
    patologias: ["Gastrite", "Refluxo gastroesofágico", "Úlcera péptica"],
    modoTomar: "Em jejum, 30 min antes do café da manhã",
    observacao: "Inibidor da bomba de prótons"
  },
  {
    id: 5,
    substancia: "LOSARTANA POTÁSSICA",
    laboratorio: "MERCK SHARP & DOHME FARMACÊUTICA LTDA",
    produto: "COZAAR",
    apresentacao: "50 MG COM REV CT BL AL AL X 30",
    classeTerapeutica: "C9A3 - ANTAGONISTAS DA ANGIOTENSINA II",
    tarja: "Tarja Vermelha",
    patologias: ["Hipertensão arterial", "Insuficiência cardíaca"],
    modoTomar: "Com ou sem alimentos",
    observacao: "Horário fixo"
  },
  {
    id: 6,
    substancia: "SINVASTATINA",
    laboratorio: "MERCK SHARP & DOHME FARMACÊUTICA LTDA",
    produto: "ZOCOR",
    apresentacao: "20 MG COM REV CT BL AL AL X 30",
    classeTerapeutica: "C10A1 - INIBIDORES DA HMG COA REDUTASE",
    tarja: "Tarja Vermelha",
    patologias: ["Hipercolesterolemia", "Dislipidemia", "Prevenção cardiovascular"],
    modoTomar: "À noite, preferencialmente 2h após jantar",
    observacao: "Ação máxima durante a síntese de colesterol"
  },
  {
    id: 7,
    substancia: "CLORIDRATO DE FLUOXETINA",
    laboratorio: "ELI LILLY DO BRASIL LTDA",
    produto: "PROZAC",
    apresentacao: "20 MG CAP DURA CT BL AL AL X 14",
    classeTerapeutica: "N6A4 - INIBIDORES SELETIVOS DA RECAPTAÇÃO DE SEROTONINA",
    tarja: "Tarja Vermelha",
    patologias: ["Depressão", "Transtorno de ansiedade", "Transtorno obsessivo-compulsivo"],
    modoTomar: "Com ou sem alimentos",
    observacao: "Efeito pode demorar semanas"
  },
  {
    id: 8,
    substancia: "ACEBROFILINA",
    laboratorio: "ACHE LABORATORIOS FARMACEUTICOS SA",
    produto: "MELYSSE",
    apresentacao: "10 MG/ML XPE CT FR PLAS AMB X 120 ML + COP X 10 ML",
    classeTerapeutica: "R5C - EXPECTORANTES",
    tarja: "Tarja Vermelha",
    patologias: ["Bronquite", "Asma", "DPOC"],
    modoTomar: "Com alimentos",
    observacao: "Mucolítico e broncodilatador"
  },
  {
    id: 9,
    substancia: "ACECLOFENACO",
    laboratorio: "EUROFARMA LABORATORIOS S.A.",
    produto: "PROFLAM",
    apresentacao: "100 MG COM REV CT BL AL/AL X 12",
    classeTerapeutica: "M1A1 - ANTIRREUMÁTICOS NÃO ESTEROIDAIS PUROS",
    tarja: "- (*)",
    patologias: ["Artrite", "Dor muscular", "Inflamação"],
    modoTomar: "Com refeição",
    observacao: "Anti-inflamatório não esteroidal"
  },
  {
    id: 10,
    substancia: "CAPTOPRIL",
    laboratorio: "MEDLEY S.A. INDÚSTRIA FARMACÊUTICA",
    produto: "CAPOTEN",
    apresentacao: "25 MG COM CT BL AL AL X 30",
    classeTerapeutica: "C9A1 - INIBIDORES DA ECA",
    tarja: "Tarja Vermelha",
    patologias: ["Hipertensão arterial", "Insuficiência cardíaca"],
    modoTomar: "Em jejum (1h antes ou 2h após refeições)",
    observacao: "Absorção reduzida com alimentos"
  }
];

export const buscarMedicamentos = (termo) => {
  if (!termo || termo.length < 2) return [];
  
  const termoLower = termo.toLowerCase();
  return medicamentosANVISA.filter(med => 
    med.produto.toLowerCase().includes(termoLower) ||
    med.substancia.toLowerCase().includes(termoLower) ||
    med.classeTerapeutica.toLowerCase().includes(termoLower)
  ).slice(0, 10);
};

export const obterMedicamentoPorId = (id) => {
  return medicamentosANVISA.find(med => med.id === parseInt(id));
};

export const obterTodasPatologias = (medicamentos) => {
  const todasPatologias = medicamentos.flatMap(med => med.patologias || []);
  return [...new Set(todasPatologias)].sort();
};