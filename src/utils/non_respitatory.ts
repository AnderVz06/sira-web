// ---- No-respiratorio: palabras/expresiones que indican fuera de dominio ORL/resp ----
export const NON_RESP_RED_FLAGS: string[] = [
  // --- Gastrointestinal / abdomen ---
  "abdominal","abdomen","dolor abdominal","distensión abdominal","distension abdominal",
  "diarrea","estreñimiento","estrenimiento","constipación","constipacion",
  "vómito","vomito","náusea","nausea","hematemesis","melena","rectorragia",
  "hematoquecia","hematoquezia","sangrado rectal","pirosis","acidez","reflujo",
  "dispepsia","ictericia","hepatomegalia","esplenomegalia",
  "cólico","colico","cólico biliar","colico biliar","apendic","colecistitis",
  "pancreatitis","hepatitis","gastroenteritis","dolor epigástrico","dolor hipogástrico",
  "dolor en fosa iliaca","fosa iliaca derecha","fosa iliaca izquierda",

  // --- Genitourinario ---
  "disuria","polaquiuria","urgencia urinaria","tenesmo vesical",
  "hematuria","dolor suprapúbico","dolor pelviano","cólico renal","colico renal",
  "litiasis","pielonefritis","prostatitis","secreción uretral","secrecion uretral",
  "oliguria","anuria","incontinencia urinaria",

  // --- Gineco-obstetricia ---
  "metrorragia","menorragia","dismenorrea","amenorrea","flujo vaginal",
  "secreción vaginal","secrecion vaginal","embarazo","gestante","puerperio",
  "dolor pélvico","dolor pelvico","epi","enfermedad pélvica inflamatoria",
  "aborto","amenaza de aborto","sangrado vaginal",

  // --- Cardiovascular (no respiratorio) ---
  "dolor torácico opresivo","dolor precordial","opresión torácica","opresion toracica",
  "palpitaciones","síncope","sincope","lipotimia",
  "edema unilateral","dolor en pantorrilla","trombosis","claudicación","claudicacion",

  // --- Neurológico / psiquiátrico ---
  "cefalea","migraña","mareos","vértigo","vertigo",
  "convulsiones","crisis convulsiva","pérdida de conciencia","perdida de conciencia",
  "déficit focal","deficit focal","hemiparesia","parestesias","ataxia",
  "rigidez de nuca","fotofobia","confusión","confusion","delirio",
  "ansiedad","depresión","depresion","ideación suicida","ideacion suicida","psicosis",
  "agitación","agitacion",

  // --- Músculo-esquelético / Trauma (incluye FRACTURA) ---
  "trauma","politrauma","accidente","caída","caida","atropello","aplastamiento",
  "fractura","fracturado","fracturarse","fractura expuesta","fractura abierta",
  "fractura cerrada","microfractura","fisura ósea","fisura osea",
  "luxación","luxacion","subluxación","subluxacion",
  "esguince","torsión","torcedura",
  "contusión","contusion","hematoma","equimosis","edema localizado",
  "herida","laceración","laceracion","abrasión","abrasion","avulsión","avulsion",
  "dolor óseo","dolor oseo","dolor articular","artralgia","artritis",
  "ruptura tendinosa","lesión tendinosa","lesion tendinosa","tendinitis","tenosinovitis",
  "lesión ligamentaria","lesion ligamentaria","rotura de ligamento",
  "lesión meniscal","lesion meniscal",
  "cervicalgia","lumbalgia","dorsalgia","dolor lumbar","dolor cervical",
  // regiones óseas frecuentes
  "cadera","pelvis","sacro","columna","columna cervical","columna dorsal","columna lumbar",
  "costilla","esternón","esternon","clavícula","clavicula","escápula","escapula",
  "húmero","humero","radio","cúbito","cubito","muñeca","mano","falange","dedo",
  "fémur","femur","tibia","peroné","perone","tobillo","pie","metatarso","falange del pie",

  // --- Dermatológico ---
  "erupción","exantema","lesión cutánea","lesion cutanea",
  "celulitis","absceso","furúnculo","furunculo",
  "prurito","urticaria","dermatitis","quemadura","quemadura química","quemadura quimica",

  // --- Oftalmo / Odonto ---
  "dolor ocular","ojo rojo","visión borrosa","vision borrosa","hiperemia conjuntival",
  "odontalgia","dolor dental","gingivorragia",

  // --- Endocrino / metabólico / tóxicos ---
  "hipoglucemia","hiperglucemia","cetoacidosis","polidipsia","poliuria",
  "pérdida de peso","perdida de peso","ganancia de peso",
  "intoxicación","intoxicacion","ingesta de tóxicos","ingesta de toxicos",
  "exposición química","exposicion quimica","sobredosis","envenenamiento",
];

const RESP_WHITELIST: string[] = [
  "tos","expectoracion","disnea","sibilancias","roncus","sibilante","sibilancia",
  "faringitis","rinorrea","odinofagia","laringitis","bronquitis","asma",
  "sibilancias difusas","sibilancias bilaterales","broncoespasmo"
];

// Normaliza: minúsculas y elimina diacríticos (compatible ampliamente)
export function normalize(text: string): string {
  return (text ?? "")
    .toLowerCase()
    // quita diacríticos: \u0300-\u036f (combining marks)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Escapa texto para usarlo en RegExp
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Compila términos a regex con límites de palabra y tolerancia a espacios
function compilePatterns(terms: string[]): RegExp[] {
  return terms.map((raw) => {
    const t = normalize(raw).trim();
    // Reemplaza espacios por \s+ y aplica límites \b
    const pattern = "\\b" + escapeRegex(t).replace(/\s+/g, "\\s+") + "\\b";
    return new RegExp(pattern, "i");
  });
}

const RED_PATTERNS = compilePatterns(NON_RESP_RED_FLAGS);
const RESP_PATTERNS = compilePatterns(RESP_WHITELIST);

export function textMatchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  const n = normalize(text ?? "");
  return patterns.some((re) => re.test(n));
}

export function isOutOfDomain(motivo: string, examen: string): boolean {
  const text = `${motivo ?? ""} ${examen ?? ""}`;
  const hasRed = textMatchesAnyPattern(text, RED_PATTERNS);
  const hasResp = textMatchesAnyPattern(text, RESP_PATTERNS);
  // Solo fuera de dominio si hay red flag y NO hay evidencia respiratoria
  return hasRed && !hasResp;
}
// (Opcional) export default si prefieres import por default
// export default isOutOfDomain;
