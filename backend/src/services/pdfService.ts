import React from 'react';
import type { SnapshotInforme } from '../models/Informe';

const e = React.createElement;

// Las fuentes base de PDF (Helvetica) usan codificación WinAnsi y no incluyen
// flechas Unicode. Sustituimos las más habituales por equivalentes seguros para
// que "7M → 18M" no salga como "7M ' 18M".
function t(v: unknown): string {
  return String(v ?? '')
    .replace(/[→⟶⇒➔➙➜⮕▶▸➙]/g, '»')
    .replace(/[←⟵⇐⬅◀◂]/g, '«')
    .replace(/[↑⬆]/g, '^')
    .replace(/[↓⬇]/g, 'v');
}

// ---------------------------------------------------------------------------
// Design tokens — sistema "Trust & Authority" (navy + azul CTA + oro champán).
// Coherente con el theme del frontend (frontend/src/theme.ts).
// ---------------------------------------------------------------------------
const C = {
  navy: '#0F172A',
  navySoft: '#1E293B',
  accent: '#0369A1',
  accentSoft: '#0EA5E9',
  gold: '#C6A15B',
  ink: '#0F172A',
  slate: '#475569',
  slateSoft: '#64748B',
  line: '#E2E8F0',
  muted: '#F1F5F9',
  paper: '#FFFFFF',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  cloud: '#CBD5E1',
  // Paneles cualitativos
  posBg: '#F0FDF4',
  posLine: '#BBF7D0',
  posInk: '#166534',
  expBg: '#EFF6FF',
  expLine: '#BFDBFE',
  expInk: '#1E3A8A',
};

const HB = 'Helvetica-Bold';
const H = 'Helvetica';
const HO = 'Helvetica-Oblique';

// Recorta un score a [0, 100] para el ancho de la barra.
function clampScore(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

// Color de la barra según el tramo (systematic, no arbitrario).
function scoreColor(score: number): string {
  if (score >= 90) return C.gold;
  if (score >= 75) return C.accent;
  if (score >= 55) return C.accentSoft;
  return C.slateSoft;
}

// Genera el PDF del informe a partir del snapshot inmutable (sin Chromium).
// @react-pdf/renderer se importa de forma perezosa (es ESM): así el resto de la app
// (y los tests) no lo cargan salvo cuando realmente se genera un PDF.
export async function generarPdfInforme(snapshot: SnapshotInforme): Promise<Buffer> {
  const {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Svg,
    Circle,
    Line,
    renderToBuffer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = (await import('@react-pdf/renderer')) as any;

  const s = StyleSheet.create({
    page: {
      paddingTop: 74,
      paddingBottom: 54,
      paddingHorizontal: 44,
      fontSize: 9.5,
      fontFamily: H,
      color: C.ink,
      lineHeight: 1.45,
      backgroundColor: C.white,
    },

    // --- Marca de agua (retícula translúcida, fija en cada página) ---
    watermark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    watermarkWrap: {
      position: 'absolute',
      top: 250,
      left: 97,
      width: 400,
      height: 400,
    },

    // --- Cabecera / pie corridos ---
    header: { position: 'absolute', top: 26, left: 44, right: 44 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    headerLeft: { flex: 1, marginRight: 18 },
    headerClient: { fontSize: 7.5, letterSpacing: 1.4, color: C.slateSoft },
    headerProc: { fontSize: 8.5, fontFamily: HB, color: C.navy, letterSpacing: 0.5 },
    headerDate: { fontSize: 8, color: C.slateSoft, flexShrink: 0 },
    headerRule: { marginTop: 6, height: 2, backgroundColor: C.navy, width: 46 },
    headerHair: { marginTop: 2, height: 0.6, backgroundColor: C.line },

    footer: {
      position: 'absolute',
      bottom: 24,
      left: 44,
      right: 44,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerHair: { position: 'absolute', bottom: 44, left: 44, right: 44, height: 0.6, backgroundColor: C.line },
    footerText: { fontSize: 7.5, color: C.slateSoft, letterSpacing: 0.3 },

    // --- Portada ---
    coverWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    coverMark: { alignItems: 'center', marginBottom: 10 },
    coverWord: { fontSize: 15, fontFamily: HB, color: C.navy, marginTop: 12, letterSpacing: 0.3 },
    coverWordDot: { color: C.gold },
    coverKicker: {
      fontSize: 8.5,
      letterSpacing: 2.4,
      color: C.slateSoft,
      marginTop: 4,
      marginBottom: 30,
      textTransform: 'uppercase',
    },
    coverCard: {
      backgroundColor: C.navy,
      borderRadius: 6,
      paddingVertical: 30,
      paddingHorizontal: 40,
      alignItems: 'center',
      width: 420,
    },
    coverGoldTick: { width: 34, height: 2, backgroundColor: C.gold, marginBottom: 16 },
    coverTitle: {
      fontSize: 21,
      fontFamily: HB,
      color: C.white,
      textAlign: 'center',
      letterSpacing: 0.6,
      lineHeight: 1.25,
    },
    coverSub: { fontSize: 10, color: C.cloud, textAlign: 'center', marginTop: 12, lineHeight: 1.5 },
    coverMeta: { alignItems: 'center', marginTop: 34 },
    coverClient: { fontSize: 12, fontFamily: HB, color: C.navy, letterSpacing: 0.4 },
    coverVertical: { fontSize: 9, color: C.slate, marginTop: 3 },
    coverConf: { fontSize: 8, color: C.slateSoft, marginTop: 22, letterSpacing: 0.5, textAlign: 'center' },

    // --- Ribbon de candidato ---
    ribbon: {
      backgroundColor: C.navy,
      borderRadius: 5,
      paddingVertical: 11,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    ribbonLeft: { flexDirection: 'row', alignItems: 'baseline' },
    ribbonIdx: { fontSize: 10, fontFamily: HB, color: C.gold, marginRight: 6 },
    ribbonLabel: { fontSize: 9, color: C.cloud, marginRight: 6 },
    ribbonName: { fontSize: 13, fontFamily: HB, color: C.white, letterSpacing: 0.3 },
    pill: {
      borderWidth: 0.8,
      borderColor: 'rgba(255,255,255,0.35)',
      borderRadius: 20,
      paddingVertical: 3,
      paddingHorizontal: 10,
    },
    pillText: { fontSize: 7.5, color: C.white, letterSpacing: 1, textTransform: 'uppercase' },

    // --- Encabezado de sección ---
    sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
    sectionTick: { width: 3, height: 12, backgroundColor: C.gold, borderRadius: 2, marginRight: 7 },
    sectionText: { fontSize: 10.5, fontFamily: HB, color: C.navy, letterSpacing: 0.3 },
    sectionRule: { height: 0.6, backgroundColor: C.line, marginBottom: 4 },

    // --- Tabla de datos ---
    table: { borderWidth: 0.8, borderColor: C.line, borderRadius: 5, overflow: 'hidden' },
    row: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: C.line },
    rowLast: { flexDirection: 'row' },
    cellKey: {
      width: 150,
      backgroundColor: C.muted,
      paddingVertical: 7,
      paddingHorizontal: 11,
      fontSize: 9,
      fontFamily: HB,
      color: C.slate,
    },
    cellVal: { flex: 1, paddingVertical: 7, paddingHorizontal: 12, fontSize: 9.5, color: C.ink },

    // --- KPI boxes ---
    kpiRow: { flexDirection: 'row', justifyContent: 'space-between' },
    kpiBox: {
      flex: 1,
      backgroundColor: C.bg,
      borderWidth: 0.8,
      borderColor: C.line,
      borderRadius: 6,
      paddingTop: 12,
      paddingBottom: 11,
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    kpiTopRule: { width: 20, height: 2, backgroundColor: C.gold, marginBottom: 8, borderRadius: 2 },
    kpiValue: { fontSize: 15, fontFamily: HB, color: C.navy, textAlign: 'center' },
    kpiDesc: { fontSize: 7.8, color: C.slateSoft, textAlign: 'center', marginTop: 5, lineHeight: 1.4 },

    // --- Trayectoria ---
    traItem: { flexDirection: 'row', marginBottom: 6 },
    traBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 4, marginRight: 8 },
    traBody: { flex: 1 },
    traHead: { fontSize: 9.5, color: C.ink },
    traCompany: { fontFamily: HB, color: C.navy },
    traMeta: { color: C.slateSoft },
    traDesc: { fontSize: 9, color: C.slate, marginTop: 1 },

    // --- Evaluación por dimensiones ---
    dimGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dimItem: { width: '48%', marginBottom: 11 },
    dimTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
    dimName: { fontSize: 9, color: C.ink, flex: 1, marginRight: 6 },
    dimScore: { fontSize: 9, fontFamily: HB, color: C.navy },
    dimScoreMax: { fontSize: 7.5, color: C.slateSoft },
    track: { height: 5, backgroundColor: C.muted, borderRadius: 3, overflow: 'hidden' },
    fill: { height: 5, borderRadius: 3 },
    dimComment: { fontSize: 7.8, color: C.slateSoft, marginTop: 3, lineHeight: 1.35 },

    // --- Fortalezas / puntos ---
    twoCol: { flexDirection: 'row', justifyContent: 'space-between' },
    panel: { width: '48%', borderWidth: 0.8, borderRadius: 6, padding: 11 },
    panelPos: { backgroundColor: C.posBg, borderColor: C.posLine },
    panelExp: { backgroundColor: C.expBg, borderColor: C.expLine },
    panelHead: { fontSize: 9, fontFamily: HB, marginBottom: 7, letterSpacing: 0.3 },
    panelHeadPos: { color: C.posInk },
    panelHeadExp: { color: C.expInk },
    liRow: { flexDirection: 'row', marginBottom: 5 },
    liDot: { fontSize: 9, marginRight: 6, lineHeight: 1.4 },
    liDotPos: { color: C.posInk },
    liDotExp: { color: C.expInk },
    liText: { flex: 1, fontSize: 8.8, color: C.slate, lineHeight: 1.4 },

    empty: { fontSize: 9, color: C.slateSoft, fontFamily: HO, marginTop: 4 },
  });

  // -- Retícula "mira de caza" (monograma de marca) como vector reutilizable --
  const reticle = (size: number, ring: string, dot: string, opacity: number) =>
    e(
      Svg,
      { viewBox: '0 0 40 40', style: { width: size, height: size }, opacity },
      e(Circle, { cx: 20, cy: 20, r: 15, stroke: ring, strokeWidth: 1.4, fill: 'none' }),
      e(Circle, { cx: 20, cy: 20, r: 7.5, stroke: ring, strokeWidth: 1.4, fill: 'none' }),
      e(Line, { x1: 20, y1: 1, x2: 20, y2: 10, stroke: ring, strokeWidth: 1.4 }),
      e(Line, { x1: 20, y1: 30, x2: 20, y2: 39, stroke: ring, strokeWidth: 1.4 }),
      e(Line, { x1: 1, y1: 20, x2: 10, y2: 20, stroke: ring, strokeWidth: 1.4 }),
      e(Line, { x1: 30, y1: 20, x2: 39, y2: 20, stroke: ring, strokeWidth: 1.4 }),
      e(Circle, { cx: 20, cy: 20, r: 3, fill: dot }),
    );

  // Fondo translúcido (fijo en cada página): gran retícula de marca al 4%.
  const fondo = () =>
    e(
      View,
      { style: s.watermark, fixed: true },
      e(View, { style: s.watermarkWrap }, reticle(400, C.navy, C.gold, 0.04)),
    );

  const proceso = snapshot.proceso ?? {};
  const clienteNombre = t(proceso.cliente ?? 'Cliente');
  const tituloProc = t(proceso.titulo ?? 'Informe ejecutivo de candidatos');
  const fechaLarga = new Date(snapshot.generadoEl ?? Date.now()).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const fechaCap = fechaLarga.replace(/^\w/, (c) => c.toUpperCase());
  // Etiqueta corta para la cabecera corrida: preferimos la vertical (breve) al
  // título completo del mandato, que desbordaría contra la fecha.
  const cabeceraProc = `${t(proceso.vertical || tituloProc)} · CONFIDENCIAL`.toUpperCase();

  // Cabecera corrida.
  const header = () =>
    e(
      View,
      { style: s.header, fixed: true },
      e(
        View,
        { style: s.headerRow },
        e(
          View,
          { style: s.headerLeft },
          e(Text, { style: s.headerClient }, clienteNombre.toUpperCase()),
          e(Text, { style: s.headerProc }, cabeceraProc),
        ),
        e(Text, { style: s.headerDate }, fechaCap),
      ),
      e(View, { style: s.headerRule }),
      e(View, { style: s.headerHair }),
    );

  // Pie corrido con numeración (render prop de react-pdf).
  const footer = () =>
    e(
      React.Fragment,
      {},
      e(View, { style: s.footerHair, fixed: true }),
      e(
        View,
        { style: s.footer, fixed: true },
        e(Text, { style: s.footerText }, 'Documento confidencial — uso exclusivo del Board'),
        e(
          Text,
          {
            style: s.footerText,
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Página ${pageNumber} de ${totalPages}`,
          },
        ),
      ),
    );

  const sectionHead = (titulo: string) =>
    e(
      View,
      {},
      e(
        View,
        { style: s.sectionHead },
        e(View, { style: s.sectionTick }),
        e(Text, { style: s.sectionText }, titulo),
      ),
      e(View, { style: s.sectionRule }),
    );

  // ---- Bloques por candidato ----

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datosTable = (c: any) => {
    const filas: Array<[string, string | null | undefined]> = [
      ['Posición actual', c.posicionActualSnapshot],
      ['Ciudad', c.ciudad],
      ['Idiomas', c.idiomas],
      ['Formación', c.formacion],
      ['Expectativa salarial', c.expectativaSalarial],
    ].filter(([, v]) => v != null && String(v).trim() !== '') as Array<[string, string]>;

    if (filas.length === 0) return null;

    return e(
      View,
      { style: s.table, wrap: false },
      ...filas.map(([k, v], i) =>
        e(
          View,
          { key: k, style: i === filas.length - 1 ? s.rowLast : s.row },
          e(Text, { style: s.cellKey }, k),
          e(Text, { style: s.cellVal }, t(v)),
        ),
      ),
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kpis = (metricas: any[]) => {
    if (!metricas || metricas.length === 0) return null;
    const items = metricas.slice(0, 3);
    return e(
      View,
      { wrap: false },
      sectionHead('Métricas destacadas'),
      e(
        View,
        { style: s.kpiRow },
        ...items.map((m, i) =>
          e(
            View,
            { key: i, style: [s.kpiBox, i < items.length - 1 ? { marginRight: 10 } : {}] },
            e(View, { style: s.kpiTopRule }),
            e(Text, { style: s.kpiValue }, t(m.valor)),
            e(Text, { style: s.kpiDesc }, t(m.descripcion)),
          ),
        ),
      ),
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trayectoria = (items: any[]) => {
    if (!items || items.length === 0) return null;
    return e(
      View,
      {},
      sectionHead('Trayectoria profesional destacada'),
      ...items.map((x, i) => {
        const meta = [x.cargo, x.periodo ? `(${x.periodo})` : null].filter(Boolean).join(' ');
        return e(
          View,
          { key: i, style: s.traItem, wrap: false },
          e(View, { style: s.traBullet }),
          e(
            View,
            { style: s.traBody },
            e(
              Text,
              { style: s.traHead },
              e(Text, { style: s.traCompany }, t(x.empresa)),
              meta ? e(Text, { style: s.traMeta }, ` — ${t(meta)}`) : null,
            ),
            x.descripcion ? e(Text, { style: s.traDesc }, t(x.descripcion)) : null,
          ),
        );
      }),
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evaluacion = (scores: any[]) => {
    if (!scores || scores.length === 0) return null;
    return e(
      View,
      {},
      sectionHead('Evaluación por dimensiones clave del rol'),
      e(
        View,
        { style: s.dimGrid },
        ...scores.map((sc, i) => {
          const val = clampScore(sc.score);
          const col = scoreColor(val);
          return e(
            View,
            { key: i, style: s.dimItem, wrap: false },
            e(
              View,
              { style: s.dimTop },
              e(Text, { style: s.dimName }, t(sc.dimension)),
              e(
                Text,
                {},
                e(Text, { style: s.dimScore }, `${val}`),
                e(Text, { style: s.dimScoreMax }, '/100'),
              ),
            ),
            e(
              View,
              { style: s.track },
              e(View, { style: [s.fill, { width: `${val}%`, backgroundColor: col }] }),
            ),
            sc.comentario ? e(Text, { style: s.dimComment }, t(sc.comentario)) : null,
          );
        }),
      ),
    );
  };

  const bullets = (arr: string[], dotStyle: object, headStyle: object, titulo: string) =>
    e(
      View,
      { style: [s.panel, titulo === 'Fortalezas' ? s.panelPos : s.panelExp] },
      e(Text, { style: [s.panelHead, headStyle] }, titulo),
      ...(arr.length
        ? arr.map((txt, i) =>
            e(
              View,
              { key: i, style: s.liRow },
              e(Text, { style: [s.liDot, dotStyle] }, '•'),
              e(Text, { style: s.liText }, t(txt)),
            ),
          )
        : [e(Text, { key: 'x', style: s.liText }, '—')]),
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fortalezasPuntos = (obs: any) => {
    const fortalezas: string[] = obs?.fortalezas ?? [];
    const puntos: string[] = obs?.puntosExplorar ?? [];
    if (fortalezas.length === 0 && puntos.length === 0) return null;
    return e(
      View,
      { wrap: false },
      sectionHead('Fortalezas y puntos a explorar'),
      e(
        View,
        { style: s.twoCol },
        bullets(fortalezas, s.liDotPos, s.panelHeadPos, 'Fortalezas'),
        bullets(puntos, s.liDotExp, s.panelHeadExp, 'Puntos a explorar'),
      ),
    );
  };

  // ---- Portada ----
  const portada = () =>
    e(
      Page,
      { size: 'A4', style: s.page },
      fondo(),
      header(),
      footer(),
      e(
        View,
        { style: s.coverWrap },
        e(
          View,
          { style: s.coverMark },
          reticle(58, C.navy, C.gold, 1),
          e(
            Text,
            { style: s.coverWord },
            'TheHunter',
            e(Text, { style: s.coverWordDot }, '.tech'),
          ),
          e(Text, { style: s.coverKicker }, 'Executive Search'),
        ),
        e(
          View,
          { style: s.coverCard },
          e(View, { style: s.coverGoldTick }),
          e(Text, { style: s.coverTitle }, 'INFORME EJECUTIVO\nDE CANDIDATOS'),
          e(Text, { style: s.coverSub }, tituloProc),
        ),
        e(
          View,
          { style: s.coverMeta },
          e(Text, { style: s.coverClient }, clienteNombre),
          proceso.vertical
            ? e(Text, { style: s.coverVertical }, t(proceso.vertical))
            : null,
          e(
            Text,
            { style: s.coverConf },
            `${fechaCap}   ·   ${t(
              proceso.confidencialidad ?? 'Confidencial — uso exclusivo del Board',
            )}`,
          ),
        ),
      ),
    );

  // ---- Página por candidato ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginaCandidato = (c: any, idx: number) =>
    e(
      Page,
      { key: idx, size: 'A4', style: s.page },
      fondo(),
      header(),
      footer(),
      e(
        View,
        { style: s.ribbon },
        e(
          View,
          { style: s.ribbonLeft },
          e(Text, { style: s.ribbonIdx }, `#${idx + 1}`),
          e(Text, { style: s.ribbonLabel }, 'Candidato:'),
          e(Text, { style: s.ribbonName }, t(c.nombre ?? `Candidato ${idx + 1}`)),
        ),
        c.etapa ? e(View, { style: s.pill }, e(Text, { style: s.pillText }, t(c.etapa))) : null,
      ),
      datosTable(c),
      kpis(c.metricas),
      trayectoria(c.trayectoria),
      evaluacion(c.scores),
      fortalezasPuntos(c.observaciones),
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidatos: any[] = snapshot.candidatos ?? [];

  const paginasCandidatos = candidatos.length
    ? candidatos.map((c, i) => paginaCandidato(c, i))
    : [
        e(
          Page,
          { key: 'empty', size: 'A4', style: s.page },
          fondo(),
          header(),
          footer(),
          sectionHead('Resumen ejecutivo'),
          e(Text, { style: s.empty }, 'Este informe no incluye candidatos.'),
        ),
      ];

  const doc = e(Document, {}, portada(), ...paginasCandidatos);

  return renderToBuffer(doc);
}
