/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import path from 'path';
import React from 'react';

// -----------------------------------------------------------------------------
// Generador del "Manual de usuario" de TheHunter.tech en PDF.
//
// Reutiliza el sistema de diseño de marca del informe ejecutivo
// (backend/src/services/pdfService.ts): navy + azul CTA + oro champán, con la
// retícula de "mira de caza" como monograma. Sin Chromium: usa @react-pdf/renderer.
//
// Ejecutar:  npx ts-node src/scripts/generarManualPdf.ts
// Salida:    ../Documentacion funcional/Manual-de-usuario-TheHunter.pdf
// -----------------------------------------------------------------------------

const e = React.createElement;

// Las fuentes base (Helvetica, WinAnsi) no traen flechas Unicode; las sustituimos.
function t(v: unknown): string {
  return String(v ?? '')
    .replace(/[→⟶⇒➔]/g, '»')
    .replace(/[←⟵⇐]/g, '«')
    .replace(/[↑⬆]/g, '^')
    .replace(/[↓⬇]/g, 'v');
}

// --- Design tokens (coherentes con pdfService.ts / frontend theme) ---
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
  bg: '#F8FAFC',
  white: '#FFFFFF',
  cloud: '#CBD5E1',
  tipBg: '#F0FDF4',
  tipLine: '#BBF7D0',
  tipInk: '#166534',
  noteBg: '#EFF6FF',
  noteLine: '#BFDBFE',
  noteInk: '#1E3A8A',
  warnBg: '#FEF3C7',
  warnLine: '#FDE68A',
  warnInk: '#92400E',
  adminBg: '#EEF2FF',
  adminInk: '#4338CA',
};

const H = 'Helvetica';
const HB = 'Helvetica-Bold';
const HO = 'Helvetica-Oblique';

async function main() {
  const {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Svg,
    Circle,
    Line,
    renderToFile,
  } = (await import('@react-pdf/renderer')) as any;

  const s = StyleSheet.create({
    page: {
      paddingTop: 66,
      paddingBottom: 52,
      paddingHorizontal: 48,
      fontSize: 10,
      fontFamily: H,
      color: C.ink,
      lineHeight: 1.5,
      backgroundColor: C.white,
    },

    // Marca de agua
    watermark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    watermarkWrap: { position: 'absolute', top: 300, left: 120, width: 360, height: 360 },

    // Cabecera / pie corridos
    header: { position: 'absolute', top: 24, left: 48, right: 48 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    headerBrand: { fontSize: 8.5, fontFamily: HB, color: C.navy, letterSpacing: 0.4 },
    headerBrandDot: { color: C.gold },
    headerMeta: { fontSize: 7.5, color: C.slateSoft, letterSpacing: 0.8 },
    headerHair: { marginTop: 5, height: 0.6, backgroundColor: C.line },

    footer: {
      position: 'absolute',
      bottom: 22,
      left: 48,
      right: 48,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerHair: { position: 'absolute', bottom: 42, left: 48, right: 48, height: 0.6, backgroundColor: C.line },
    footerText: { fontSize: 7.5, color: C.slateSoft, letterSpacing: 0.3 },

    // Portada
    coverWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    coverMark: { alignItems: 'center', marginBottom: 8 },
    coverWord: { fontSize: 16, fontFamily: HB, color: C.navy, marginTop: 12, letterSpacing: 0.3 },
    coverWordDot: { color: C.gold },
    coverKicker: {
      fontSize: 8.5,
      letterSpacing: 2.6,
      color: C.slateSoft,
      marginTop: 5,
      marginBottom: 32,
      textTransform: 'uppercase',
    },
    coverCard: {
      backgroundColor: C.navy,
      borderRadius: 6,
      paddingVertical: 34,
      paddingHorizontal: 44,
      alignItems: 'center',
      width: 430,
    },
    coverGoldTick: { width: 36, height: 2, backgroundColor: C.gold, marginBottom: 18 },
    coverTitle: { fontSize: 24, fontFamily: HB, color: C.white, textAlign: 'center', letterSpacing: 0.8 },
    coverSub: { fontSize: 10.5, color: C.cloud, textAlign: 'center', marginTop: 14, lineHeight: 1.5 },
    coverMeta: { alignItems: 'center', marginTop: 36 },
    coverVersion: { fontSize: 11, fontFamily: HB, color: C.navy, letterSpacing: 0.4 },
    coverConf: { fontSize: 8, color: C.slateSoft, marginTop: 18, letterSpacing: 0.6, textAlign: 'center' },

    // Índice
    tocTitle: { fontSize: 18, fontFamily: HB, color: C.navy, letterSpacing: 0.4, marginBottom: 4 },
    tocRule: { height: 2, width: 46, backgroundColor: C.gold, borderRadius: 2, marginBottom: 18 },
    tocRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 9 },
    tocNum: { width: 26, fontSize: 10, fontFamily: HB, color: C.gold },
    tocLabel: { flex: 1, fontSize: 11, color: C.ink },
    tocAdmin: { fontSize: 7, color: C.adminInk, fontFamily: HB, letterSpacing: 0.4 },

    // Encabezado de sección
    secWrap: { marginBottom: 4 },
    secKicker: { fontSize: 8, letterSpacing: 2, color: C.slateSoft, textTransform: 'uppercase' },
    secRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    secNum: { fontSize: 22, fontFamily: HB, color: C.gold, marginRight: 10 },
    secTitle: { fontSize: 17, fontFamily: HB, color: C.navy, letterSpacing: 0.3, flex: 1 },
    secRule: { height: 0.8, backgroundColor: C.line, marginTop: 10, marginBottom: 12 },

    // Subsección
    subHead: { fontSize: 11.5, fontFamily: HB, color: C.navy, marginTop: 14, marginBottom: 5 },
    subTick: { width: 3, height: 11, backgroundColor: C.accentSoft, borderRadius: 2, marginRight: 6 },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 5 },

    para: { fontSize: 10, color: C.slate, marginBottom: 7, lineHeight: 1.55 },
    strong: { fontFamily: HB, color: C.ink },

    // Bullets
    liRow: { flexDirection: 'row', marginBottom: 5 },
    liDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 5, marginRight: 9 },
    liText: { flex: 1, fontSize: 10, color: C.slate, lineHeight: 1.5 },

    // Pasos numerados
    stepRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
    stepBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: C.navy,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    stepBadgeText: { fontSize: 9, fontFamily: HB, color: C.white },
    stepText: { flex: 1, fontSize: 10, color: C.slate, lineHeight: 1.5, paddingTop: 1 },

    // Callouts
    callout: { borderWidth: 0.8, borderRadius: 6, borderLeftWidth: 3, padding: 11, marginVertical: 8 },
    calloutHead: { fontSize: 8.5, fontFamily: HB, letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase' },
    calloutText: { fontSize: 9.3, lineHeight: 1.5 },

    // Tabla clave/valor
    table: { borderWidth: 0.8, borderColor: C.line, borderRadius: 6, overflow: 'hidden', marginVertical: 8 },
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
    cellVal: { flex: 1, paddingVertical: 7, paddingHorizontal: 12, fontSize: 9.3, color: C.ink, lineHeight: 1.45 },

    // Tabla de roles (3 col)
    rtHeadRow: { flexDirection: 'row', backgroundColor: C.navy },
    rtHeadCell: { paddingVertical: 7, paddingHorizontal: 10, fontSize: 8.5, fontFamily: HB, color: C.white },
    rtRow: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: C.line },
    rtCell: { paddingVertical: 6, paddingHorizontal: 10, fontSize: 9, color: C.slate },

    // Etiqueta admin
    adminTag: {
      alignSelf: 'flex-start',
      backgroundColor: C.adminBg,
      borderRadius: 20,
      paddingVertical: 3,
      paddingHorizontal: 10,
      marginBottom: 8,
    },
    adminTagText: { fontSize: 7.5, fontFamily: HB, color: C.adminInk, letterSpacing: 0.6, textTransform: 'uppercase' },

    // Divider fino
    hair: { height: 0.6, backgroundColor: C.line, marginVertical: 10 },
  });

  // Retícula de marca (monograma reutilizable).
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

  const fondo = () =>
    e(View, { style: s.watermark, fixed: true }, e(View, { style: s.watermarkWrap }, reticle(360, C.navy, C.gold, 0.035)));

  const header = () =>
    e(
      View,
      { style: s.header, fixed: true },
      e(
        View,
        { style: s.headerRow },
        e(Text, { style: s.headerBrand }, 'TheHunter', e(Text, { style: s.headerBrandDot }, '.tech')),
        e(Text, { style: s.headerMeta }, 'MANUAL DE USUARIO · CONFIDENCIAL'),
      ),
      e(View, { style: s.headerHair }),
    );

  // Pie con numeración dinámica (render prop). Solo apto para páginas que NO se
  // paginan (portada/índice); en el cuerpo largo usar footerBody() estático.
  const footer = () =>
    e(
      React.Fragment,
      {},
      e(View, { style: s.footerHair, fixed: true }),
      e(
        View,
        { style: s.footer, fixed: true },
        e(Text, { style: s.footerText }, 'Uso interno — TheHunter.tech Executive Search'),
        e(Text, {
          style: s.footerText,
          render: ({ pageNumber, totalPages }: any) => `Página ${pageNumber} de ${totalPages}`,
        }),
      ),
    );

  // Pie estático para el cuerpo (sin render dinámico, seguro en multipágina).
  const footerBody = () =>
    e(
      React.Fragment,
      {},
      e(View, { style: s.footerHair, fixed: true }),
      e(
        View,
        { style: s.footer, fixed: true },
        e(Text, { style: s.footerText }, 'Uso interno — TheHunter.tech Executive Search'),
        e(Text, { style: s.footerText }, 'Documento confidencial'),
      ),
    );

  // ---- Helpers de contenido ----
  const P = (...children: any[]) => e(Text, { style: s.para }, ...children);
  const B = (txt: string) => e(Text, { style: s.strong }, t(txt));

  const bullets = (items: (string | any[])[]) =>
    e(
      View,
      { style: { marginBottom: 4 } },
      ...items.map((it, i) =>
        e(
          View,
          { key: i, style: s.liRow },
          e(View, { style: s.liDot }),
          e(Text, { style: s.liText }, Array.isArray(it) ? it : t(it)),
        ),
      ),
    );

  const steps = (items: (string | any[])[]) =>
    e(
      View,
      { style: { marginVertical: 4 } },
      ...items.map((it, i) =>
        e(
          View,
          { key: i, style: s.stepRow },
          e(View, { style: s.stepBadge }, e(Text, { style: s.stepBadgeText }, String(i + 1))),
          e(Text, { style: s.stepText }, Array.isArray(it) ? it : t(it)),
        ),
      ),
    );

  const CALLOUT: Record<string, { bg: string; line: string; ink: string; label: string }> = {
    tip: { bg: C.tipBg, line: C.tipLine, ink: C.tipInk, label: 'Consejo' },
    note: { bg: C.noteBg, line: C.noteLine, ink: C.noteInk, label: 'Nota' },
    warn: { bg: C.warnBg, line: C.warnLine, ink: C.warnInk, label: 'Importante' },
  };
  const callout = (kind: 'tip' | 'note' | 'warn', text: string, label?: string) => {
    const cc = CALLOUT[kind];
    return e(
      View,
      { style: [s.callout, { backgroundColor: cc.bg, borderColor: cc.line, borderLeftColor: cc.ink }] },
      e(Text, { style: [s.calloutHead, { color: cc.ink }] }, label ?? cc.label),
      e(Text, { style: [s.calloutText, { color: cc.ink }] }, t(text)),
    );
  };

  const subHead = (titulo: string) =>
    e(View, { style: s.subRow }, e(View, { style: s.subTick }), e(Text, { style: s.subHead, ...{} }, t(titulo)));

  const kvTable = (rows: [string, string][]) =>
    e(
      View,
      { style: s.table },
      ...rows.map(([k, v], i) =>
        e(
          View,
          { key: k, style: i === rows.length - 1 ? s.rowLast : s.row },
          e(Text, { style: s.cellKey }, t(k)),
          e(Text, { style: s.cellVal }, t(v)),
        ),
      ),
    );

  const adminTag = () =>
    e(View, { style: s.adminTag }, e(Text, { style: s.adminTagText }, 'Solo Administrador'));

  // Encabezado de sección numerada (fuerza salto de página salvo la primera).
  const section = (num: number, kicker: string, titulo: string, breakBefore = true) =>
    e(
      View,
      { break: breakBefore, style: s.secWrap },
      e(Text, { style: s.secKicker }, t(kicker)),
      e(
        View,
        { style: s.secRow },
        e(Text, { style: s.secNum }, String(num).padStart(2, '0')),
        e(Text, { style: s.secTitle }, t(titulo)),
      ),
      e(View, { style: s.secRule }),
    );

  // ------------------------------------------------------------------
  // PORTADA
  // ------------------------------------------------------------------
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const portada = e(
    Page,
    { size: 'A4', style: s.page },
    fondo(),
    e(
      View,
      { style: s.coverWrap },
      e(
        View,
        { style: s.coverMark },
        reticle(60, C.navy, C.gold, 1),
        e(Text, { style: s.coverWord }, 'TheHunter', e(Text, { style: s.coverWordDot }, '.tech')),
        e(Text, { style: s.coverKicker }, 'Executive Search'),
      ),
      e(
        View,
        { style: s.coverCard },
        e(View, { style: s.coverGoldTick }),
        e(Text, { style: s.coverTitle }, 'MANUAL DE USUARIO'),
        e(
          Text,
          { style: s.coverSub },
          'Guía completa de la plataforma interna de búsqueda de\naltos directivos y asesoramiento de liderazgo.',
        ),
      ),
      e(
        View,
        { style: s.coverMeta },
        e(Text, { style: s.coverVersion }, `Versión 1.0  ·  ${fecha}`),
        e(Text, { style: s.coverConf }, 'Documento confidencial — uso exclusivo del equipo interno'),
      ),
    ),
  );

  // ------------------------------------------------------------------
  // ÍNDICE
  // ------------------------------------------------------------------
  const TOC: { n: number; label: string; admin?: boolean }[] = [
    { n: 1, label: 'Introducción' },
    { n: 2, label: 'Acceso a la plataforma' },
    { n: 3, label: 'Roles y permisos' },
    { n: 4, label: 'La pantalla de Inicio' },
    { n: 5, label: 'Clientes' },
    { n: 6, label: 'Mandatos' },
    { n: 7, label: 'Pipeline de candidatos' },
    { n: 8, label: 'Evaluación de candidatos' },
    { n: 9, label: 'Base de talento' },
    { n: 10, label: 'Informes ejecutivos' },
    { n: 11, label: 'Compartir informes: PDF y enlaces públicos' },
    { n: 12, label: 'Catálogos', admin: true },
    { n: 13, label: 'Plantillas de pipeline', admin: true },
    { n: 14, label: 'Gestión de usuarios', admin: true },
    { n: 15, label: 'Flujo de trabajo recomendado' },
    { n: 16, label: 'Preguntas frecuentes' },
    { n: 17, label: 'Glosario' },
  ];

  const indice = e(
    Page,
    { size: 'A4', style: s.page },
    fondo(),
    header(),
    footer(),
    e(Text, { style: s.tocTitle }, 'Contenido'),
    e(View, { style: s.tocRule }),
    ...TOC.map((row) =>
      e(
        View,
        { key: row.n, style: s.tocRow },
        e(Text, { style: s.tocNum }, String(row.n).padStart(2, '0')),
        e(Text, { style: s.tocLabel }, t(row.label)),
        row.admin ? e(Text, { style: s.tocAdmin }, 'ADMIN') : null,
      ),
    ),
    callout(
      'note',
      'Este manual describe la plataforma tal como se usa desde el navegador. Las funciones marcadas como ADMIN solo están disponibles para usuarios con rol Administrador.',
    ),
  );

  // ------------------------------------------------------------------
  // CUERPO — todas las secciones en una Page que se pagina sola.
  // ------------------------------------------------------------------
  const bloques: any[] = [
    // 1. INTRODUCCIÓN
    section(1, 'Empezar aquí', 'Introducción', false),
    P(
      'TheHunter.tech es la ',
      B('plataforma interna de Executive Search'),
      ' del equipo: centraliza clientes, mandatos de búsqueda, la base de talento, la evaluación de candidatos y la generación de informes ejecutivos para presentar al Board del cliente.',
    ),
    subHead('¿Para qué sirve?'),
    bullets([
      ['Ordenar la ', B('cartera de clientes'), ' y sus contactos de decisión.'],
      ['Gestionar cada ', B('mandato'), ' (posición a cubrir) con su equipo, criterios de evaluación y estado.'],
      ['Mover candidatos por un ', B('pipeline'), ' visual tipo Kanban, etapa a etapa.'],
      ['Evaluar a cada candidato por ', B('dimensiones'), ' del rol, con métricas y observaciones.'],
      ['Mantener una ', B('base de talento'), ' viva con experiencia, skills e historial de contacto.'],
      ['Generar ', B('informes ejecutivos en PDF'), ' y compartirlos con el cliente mediante enlaces seguros.'],
    ]),
    subHead('Cómo leer este manual'),
    P(
      'Cada sección corresponde a una zona de la aplicación. Los pasos numerados describen acciones concretas; los recuadros aportan consejos, notas y avisos. La navegación entre secciones sigue el orden natural de trabajo: primero el cliente, luego el mandato, después los candidatos y por último el informe.',
    ),

    // 2. ACCESO
    section(2, 'Seguridad', 'Acceso a la plataforma'),
    P('El acceso es privado y con credenciales corporativas. No existe registro público: las cuentas las crea un Administrador.'),
    subHead('Iniciar sesión'),
    steps([
      'Abre la dirección de la plataforma en el navegador. Verás la pantalla de acceso.',
      ['Introduce tu ', B('correo corporativo'), ' y tu ', B('contraseña'), '.'],
      ['Pulsa ', B('“Acceder a la plataforma”'), '. Si las credenciales son correctas entrarás en la pantalla de Inicio.'],
    ]),
    callout('note', 'La sesión se mantiene en tu navegador. Si compartes equipo, cierra sesión al terminar desde el menú de usuario (arriba a la derecha) » “Cerrar sesión”.'),
    subHead('¿Olvidaste el acceso?'),
    P(
      'En la pantalla de acceso hay un enlace ',
      B('“¿Has olvidado tu acceso?”'),
      ' que abre un correo hacia el soporte interno. La recuperación no es automática: un Administrador debe restablecer tu contraseña desde el módulo de Usuarios.',
    ),
    callout('warn', 'La información de la plataforma es estrictamente confidencial. No compartas tus credenciales ni dejes sesiones abiertas en equipos ajenos.'),

    // 3. ROLES
    section(3, 'Permisos', 'Roles y permisos'),
    P('Existen dos roles. Determinan qué módulos ves en la barra de navegación y qué acciones puedes realizar.'),
    e(
      View,
      { style: s.table },
      e(
        View,
        { style: s.rtHeadRow },
        e(Text, { style: [s.rtHeadCell, { width: 130 }] }, 'Capacidad'),
        e(Text, { style: [s.rtHeadCell, { flex: 1 }] }, 'Socio'),
        e(Text, { style: [s.rtHeadCell, { flex: 1 }] }, 'Administrador'),
      ),
      ...(
        [
          ['Clientes y contactos', 'Sí', 'Sí'],
          ['Mandatos y pipeline', 'Sí', 'Sí'],
          ['Talento y evaluación', 'Sí', 'Sí'],
          ['Informes y enlaces', 'Sí', 'Sí'],
          ['Catálogos', 'Solo lectura', 'Crear / editar'],
          ['Plantillas de pipeline', 'No', 'Sí'],
          ['Usuarios', 'No', 'Sí'],
        ] as [string, string, string][]
      ).map((r, i, arr) =>
        e(
          View,
          { key: r[0], style: i === arr.length - 1 ? { flexDirection: 'row' } : s.rtRow },
          e(Text, { style: [s.rtCell, { width: 130, fontFamily: HB, color: C.ink }] }, r[0]),
          e(Text, { style: [s.rtCell, { flex: 1 }] }, r[1]),
          e(Text, { style: [s.rtCell, { flex: 1 }] }, r[2]),
        ),
      ),
    ),
    callout('note', 'En la interfaz, el rol “consultor” se muestra como “Socio”. Los módulos exclusivos de Administrador (Catálogos, Plantillas, Usuarios) no aparecen en la barra si tu rol es Socio.'),

    // 4. INICIO
    section(4, 'Panel', 'La pantalla de Inicio'),
    P('Es el panel de control que ves nada más entrar. Resume la actividad de búsqueda del equipo.'),
    subHead('Indicadores'),
    kvTable([
      ['Mandatos activos', 'Búsquedas abiertas en curso.'],
      ['Mandatos cerrados', 'Búsquedas ya finalizadas.'],
      ['Candidatos en base', 'Total de personas registradas en la base de talento.'],
      ['Tiempo medio de cierre', 'Días de media que tarda un mandato en cerrarse.'],
    ]),
    subHead('Mandatos por vertical'),
    P('Debajo de los indicadores, una gráfica de barras reparte los mandatos por vertical (CMO/CRO, CFO, CEO/DG, etc.), para ver de un vistazo dónde se concentra la actividad.'),

    // 5. CLIENTES
    section(5, 'Cartera', 'Clientes'),
    P('El módulo ', B('Clientes'), ' guarda las empresas para las que trabajáis y sus personas de contacto. Un cliente es el punto de partida de cualquier mandato.'),
    subHead('Crear un cliente'),
    steps([
      ['Entra en ', B('Clientes'), ' desde la barra superior.'],
      ['Pulsa ', B('“Nuevo cliente”'), '.'],
      'Rellena el nombre (obligatorio), el sector y unas notas internas opcionales.',
      ['Pulsa ', B('“Crear”'), '. Se abre la ficha del cliente.'],
    ]),
    subHead('Ficha del cliente'),
    bullets([
      ['Datos: ', B('sector'), ', ', B('estado'), ' (Activo / Inactivo) y ', B('notas'), '. Se editan con el botón ', B('“Editar”'), '.'],
      ['Contactos: personas de decisión (nombre, email y cargo). Añádelos con ', B('“Añadir contacto”'), '.'],
    ]),
    callout('tip', 'Registra el sector del cliente: se usa como contexto y ayuda a ordenar la cartera. Marca como “Inactivo” los clientes con los que ya no trabajáis en lugar de borrarlos, para conservar su histórico.'),

    // 6. MANDATOS
    section(6, 'Búsquedas', 'Mandatos'),
    P('Un ', B('mandato'), ' es una búsqueda concreta para un cliente (por ejemplo, “CMO para expansión EMEA”). Reúne el equipo asignado, los criterios de evaluación, el pipeline de candidatos y los informes.'),
    subHead('Crear un mandato'),
    steps([
      ['Entra en ', B('Mandatos'), ' y pulsa ', B('“Nuevo mandato”'), '.'],
      ['Elige el ', B('cliente'), ' y la ', B('vertical'), ' (tipo de posición).'],
      ['Escribe el ', B('título'), ' de la búsqueda.'],
      ['Selecciona una ', B('plantilla de pipeline'), ': sus etapas se copian al mandato y podrás ajustarlas después.'],
      ['Pulsa ', B('“Crear”'), '. Se abre la ficha del mandato.'],
    ]),
    subHead('Ficha del mandato'),
    P('La ficha se organiza en bloques:'),
    bullets([
      ['Cabecera: título, ', B('estado'), ' (Abierto / Cerrado / Archivado) y accesos a ', B('Pipeline'), ' y ', B('Editar'), '.'],
      ['Datos: cliente, vertical, responsable, ', B('confidencialidad'), ' y ', B('anonimizar nombres'), '.'],
      ['Dimensiones de evaluación: los criterios con los que se puntúa a cada candidato en este mandato.'],
      ['Socios asignados: el equipo, cada uno como ', B('Lead'), ' o ', B('Soporte'), '.'],
      ['Informes: histórico de informes generados, con su versión y fecha.'],
    ]),
    subHead('Configurar dimensiones y equipo'),
    steps([
      ['En ', B('“Dimensiones de evaluación”'), ' selecciona los criterios a evaluar y pulsa ', B('“Guardar dimensiones”'), '. Estas dimensiones son las que aparecerán al evaluar candidatos.'],
      ['En ', B('“Socios asignados”'), ' elige un socio, asígnale rol (Lead o Soporte), pulsa ', B('“Añadir”'), ' y luego ', B('“Guardar socios”'), '.'],
    ]),
    callout('warn', 'Asigna las dimensiones antes de empezar a evaluar candidatos: el formulario de evaluación muestra exactamente las dimensiones activas del mandato. Si no hay dimensiones, no se podrá puntuar.'),
    subHead('Editar y anonimizar'),
    P(
      'Con ',
      B('“Editar”'),
      ' cambias el título, el estado, el texto de confidencialidad y el interruptor ',
      B('“Anonimizar nombres”'),
      '. Al anonimizar, los informes ocultan el nombre real de los candidatos: útil para presentaciones sensibles al Board.',
    ),

    // 7. PIPELINE
    section(7, 'Kanban', 'Pipeline de candidatos'),
    P('El ', B('pipeline'), ' es un tablero Kanban: cada columna es una etapa del proceso y cada tarjeta un candidato. Se accede desde la ficha del mandato con el botón ', B('“Pipeline”'), '.'),
    subHead('Añadir candidatos'),
    steps([
      ['Usa el selector ', B('“Añadir candidato al pipeline”'), ' arriba a la derecha.'],
      'Busca por nombre y selecciónalo (solo aparecen los que aún no están en este pipeline).',
      ['Pulsa ', B('“Añadir”'), '. La tarjeta entra en la primera etapa.'],
    ]),
    subHead('Mover candidatos'),
    P('Arrastra una tarjeta por el tirador (icono de puntos a la izquierda) y suéltala en otra columna o posición. El cambio se guarda solo. Cada movimiento reinicia el contador de días-en-etapa del candidato.'),
    subHead('Acciones de la tarjeta'),
    bullets([
      ['Nombre del candidato » abre su ficha completa en ', B('Talento'), '.'],
      ['Botón ', B('“Evaluar”'), ' » abre el panel de evaluación (ver sección 8).'],
      ['Icono de papelera » quita al candidato de este pipeline (no lo borra de la base de talento).'],
    ]),
    subHead('Editar las etapas'),
    steps([
      ['Pulsa el botón ', B('“Etapas”'), ' (icono de engranaje).'],
      'Renombra etapas, cambia su color, marca cuáles son finales (etapa terminal como “Contratado” o “Descartado”) y arrástralas para reordenarlas.',
      'Guarda. Al borrar una etapa con candidatos, esos candidatos pasan automáticamente a la primera etapa.',
    ]),
    callout('note', 'Las etapas del pipeline son propias de cada mandato. Editarlas aquí no afecta a la plantilla original ni a otros mandatos.'),

    // 8. EVALUACIÓN
    section(8, 'Scoring', 'Evaluación de candidatos'),
    P('La evaluación se abre desde el botón ', B('“Evaluar”'), ' de una tarjeta del pipeline. Es un panel lateral con tres bloques. Recoge la valoración del candidato ', B('para ese mandato concreto'), '.'),
    subHead('1 · Puntuación por dimensión'),
    P('Aparecen las dimensiones que definiste en el mandato. Para cada una, ajusta la puntuación de ', B('0 a 100'), ' con el deslizador o el campo numérico, y añade un comentario opcional que justifique la nota.'),
    subHead('2 · Métricas destacadas'),
    P('Datos de impacto que resumen la trayectoria del candidato (por ejemplo, valor “+38%” con descripción “crecimiento de ingresos digitales”). Añade las que quieras con ', B('“Añadir”'), '; las tres primeras destacan en el informe.'),
    subHead('3 · Observaciones'),
    P('Notas cualitativas de dos tipos: ', B('Fortaleza'), ' y ', B('Punto a explorar'), '. Se muestran enfrentadas en el informe para dar una lectura equilibrada del candidato.'),
    steps([
      'Rellena los tres bloques (todos son opcionales salvo lo que quieras reflejar).',
      ['Pulsa ', B('“Guardar”'), ' en la cabecera del panel.'],
    ]),
    callout('tip', 'La evaluación se puede guardar y retomar tantas veces como quieras. Se recomienda completarla antes de generar el informe, porque el informe toma una “foto” de la evaluación en ese momento.'),

    // 9. TALENTO
    section(9, 'Base de datos', 'Base de talento'),
    P('La ', B('Base de talento'), ' es el repositorio de todas las personas: candidatos actuales y potenciales. Es independiente de los mandatos; una misma persona puede participar en varias búsquedas.'),
    subHead('Buscar y filtrar'),
    bullets([
      ['Buscador por ', B('nombre, email o LinkedIn'), '.'],
      ['Filtros por ', B('disponibilidad'), ', ', B('origen'), ' y ', B('skill'), '.'],
    ]),
    subHead('Estados de disponibilidad'),
    kvTable([
      ['Activo búsqueda', 'Busca activamente un cambio.'],
      ['Abierto a ofertas', 'No busca, pero escucha oportunidades.'],
      ['No disponible', 'No abierto a cambios ahora mismo.'],
      ['Colocado', 'Colocado recientemente en una posición.'],
      ['Desconocido', 'Sin información de disponibilidad (valor por defecto).'],
    ]),
    subHead('Crear un candidato'),
    steps([
      ['Pulsa ', B('“Nuevo candidato”'), '.'],
      'Introduce el nombre (obligatorio) y, si los tienes, email, LinkedIn, disponibilidad y origen.',
      ['Pulsa ', B('“Crear”'), '.'],
    ]),
    callout('note', 'La plataforma evita duplicados: si el email o el LinkedIn ya existen, te lleva a la ficha del candidato existente en lugar de crear uno nuevo.'),
    subHead('Ficha del candidato'),
    P('La ficha reúne todo el conocimiento sobre la persona:'),
    bullets([
      ['Perfil: contacto, ciudad, idiomas, salario estimado, formación, CV, notas internas y consentimiento ', B('RGPD'), '.'],
      ['Experiencia: histórico laboral (empresa, cargo, periodo, descripción).'],
      ['Skills: competencias etiquetadas desde el catálogo.'],
      ['Interacciones: registro de contactos (llamada, email, reunión, nota, LinkedIn) con fecha y autor.'],
      ['Documentos: CV y otros ficheros como referencia (nombre + enlace).'],
    ]),
    callout('warn', 'Marca el consentimiento RGPD cuando el candidato lo haya dado. Trata los datos personales conforme a la normativa: la base de talento contiene información sensible.'),

    // 10. INFORMES
    section(10, 'Entregable', 'Informes ejecutivos'),
    P('El ', B('informe ejecutivo'), ' es el documento que se presenta al cliente: portada de marca y una página por candidato con sus datos, métricas, trayectoria, evaluación por dimensiones y fortalezas / puntos a explorar.'),
    subHead('Generar un informe'),
    steps([
      ['En la ficha del mandato, bloque ', B('“Informes”'), ', pulsa ', B('“Generar informe”'), '.'],
      'La plataforma crea una versión numerada (v1, v2, …) con una “foto” inmutable del mandato y de las evaluaciones en ese instante.',
      'Se abre la vista previa del informe.',
    ]),
    callout('note', 'Cada informe es una versión congelada. Si actualizas evaluaciones o candidatos después, genera un informe nuevo: la versión anterior no cambia, para conservar la trazabilidad de lo que se presentó.'),
    subHead('Vista previa del informe'),
    P('Muestra el informe tal como lo verá el cliente e incluye las acciones para descargarlo en PDF y crear enlaces de compartición (sección 11).'),

    // 11. COMPARTIR
    section(11, 'Distribución', 'Compartir informes: PDF y enlaces públicos'),
    subHead('Descargar el PDF'),
    steps([
      'Abre la vista previa del informe (desde el bloque Informes del mandato).',
      ['Pulsa ', B('“Descargar PDF”'), '. Se descarga el informe con el diseño de marca listo para enviar.'],
    ]),
    subHead('Enlaces públicos'),
    P('Un ', B('enlace público'), ' permite que el cliente vea el informe en el navegador ', B('sin necesidad de cuenta'), '. Es un enlace con token, con caducidad y revocable.'),
    steps([
      ['En la vista previa, pulsa ', B('“Nuevo enlace”'), '. Se crea un enlace válido durante ', B('30 días'), '.'],
      ['En la tabla ', B('“Enlaces de compartición”'), ' pulsa ', B('“Copiar”'), ' y compártelo con el cliente.'],
      ['Para retirar el acceso antes de tiempo, pulsa ', B('“Revocar”'), ': el enlace deja de funcionar al instante.'],
    ]),
    kvTable([
      ['Activo', 'El enlace funciona y no ha caducado.'],
      ['Expirado', 'Ha pasado su fecha de caducidad.'],
      ['Revocado', 'Se retiró manualmente; ya no da acceso.'],
    ]),
    callout('warn', 'Cualquiera con el enlace puede ver el informe mientras esté activo. Compártelo solo con los interlocutores adecuados y revócalo cuando ya no sea necesario. Si el mandato tiene “Anonimizar nombres”, la versión pública también oculta los nombres.'),

    // 12. CATÁLOGOS
    section(12, 'Configuración', 'Catálogos'),
    adminTag(),
    P('Los ', B('catálogos'), ' son las listas maestras que alimentan los desplegables de toda la plataforma. Cualquier usuario los consulta, pero solo un Administrador los crea o edita.'),
    kvTable([
      ['Dimensiones', 'Criterios de evaluación de candidatos (con código, categoría y orden).'],
      ['Verticales', 'Tipos de posición / práctica (CMO, CFO, CEO, etc.).'],
      ['Skills', 'Competencias que se asignan a los candidatos.'],
      ['Orígenes', 'Cómo se ha captado a un candidato (fuente).'],
    ]),
    steps([
      ['Entra en ', B('Catálogos'), ' y elige la pestaña.'],
      'Crea, edita o retira entradas. Los cambios se reflejan de inmediato en los desplegables donde se usan.',
    ]),
    callout('tip', 'Define bien las dimensiones antes de lanzar mandatos: son la base de la evaluación y del informe. Mantén el catálogo ordenado para que las listas sean fáciles de usar.'),

    // 13. PLANTILLAS
    section(13, 'Configuración', 'Plantillas de pipeline'),
    adminTag(),
    P('Una ', B('plantilla de pipeline'), ' es un conjunto reutilizable de etapas. Al crear un mandato se eligen sus etapas de una plantilla, que se copian para poder ajustarlas sin afectar al original.'),
    subHead('Gestionar plantillas'),
    steps([
      ['Entra en ', B('Plantillas'), ' (menú de Administrador).'],
      ['Pulsa ', B('“Nueva plantilla”'), ', ponle nombre y descripción. Nace con un conjunto de etapas de ejemplo (Sourcing » Longlist » Shortlist » … » Contratado / Descartado).'],
      ['Con ', B('“Etapas”'), ' ajusta nombres, colores, orden y qué etapas son finales.'],
      ['Con ', B('“Editar”'), ' cambias el nombre y la descripción; con la papelera la eliminas.'],
    ]),
    callout('note', 'La plantilla marcada como “Por defecto” es la preseleccionada al crear un mandato y no se puede eliminar. Cambiar una plantilla no afecta a los mandatos ya creados con ella.'),

    // 14. USUARIOS
    section(14, 'Administración', 'Gestión de usuarios'),
    adminTag(),
    P('El módulo ', B('Usuarios'), ' permite a un Administrador dar de alta al equipo y gestionar sus accesos.'),
    steps([
      ['Entra en ', B('Usuarios'), ' y pulsa ', B('“Nuevo usuario”'), '.'],
      'Introduce nombre, email, contraseña inicial y rol (Socio o Administrador).',
      ['Guarda. Para modificar a alguien, usa ', B('“Editar”'), ': puedes cambiar sus datos, su rol, activarlo/desactivarlo o fijar una nueva contraseña.'],
    ]),
    callout('warn', 'Para retirar el acceso a una persona, desactívala (interruptor “Activo”) en lugar de borrarla: así se conserva su histórico de actividad en la plataforma. Asigna el rol Administrador solo a quien deba configurar catálogos, plantillas y usuarios.'),

    // 15. FLUJO RECOMENDADO
    section(15, 'End to end', 'Flujo de trabajo recomendado'),
    P('Este es el recorrido típico de una búsqueda, de principio a fin:'),
    steps([
      ['Da de alta (o localiza) el ', B('cliente'), ' y sus contactos.'],
      ['Crea el ', B('mandato'), ' eligiendo cliente, vertical, título y plantilla de pipeline.'],
      ['Configura las ', B('dimensiones de evaluación'), ' y asigna los ', B('socios'), ' del equipo.'],
      ['Registra o localiza candidatos en la ', B('base de talento'), '.'],
      ['Añádelos al ', B('pipeline'), ' del mandato y muévelos por las etapas según avanzan.'],
      ['Evalúa a cada candidato: puntuaciones, métricas y observaciones.'],
      ['Genera el ', B('informe ejecutivo'), ' y revísalo en la vista previa.'],
      ['Comparte el ', B('PDF'), ' o un ', B('enlace público'), ' con el cliente; revoca el enlace cuando ya no haga falta.'],
      ['Al terminar, marca el mandato como ', B('Cerrado'), '.'],
    ]),

    // 16. FAQ
    section(16, 'Ayuda', 'Preguntas frecuentes'),
    subHead('¿Por qué no veo Catálogos, Plantillas o Usuarios?'),
    P('Porque son módulos solo para Administradores. Si necesitas acceso, pídelo a un Administrador del equipo.'),
    subHead('Quité un candidato del pipeline por error, ¿se ha borrado?'),
    P('No. Quitarlo del pipeline no lo elimina de la base de talento. Vuelve a añadirlo desde el selector del pipeline; eso sí, su posición y su evaluación anteriores en ese mandato no se recuperan.'),
    subHead('Cambié una evaluación después de generar el informe y el PDF no cambia.'),
    P('Es correcto: el informe es una versión congelada. Genera un informe nuevo para incorporar los cambios; se creará como una versión superior (v2, v3, …).'),
    subHead('El cliente dice que el enlace no funciona.'),
    P('Comprueba su estado en la tabla de enlaces: puede estar Expirado (más de 30 días) o Revocado. Crea un enlace nuevo y vuelve a enviarlo.'),
    subHead('¿Cómo oculto los nombres de los candidatos al cliente?'),
    P('Activa “Anonimizar nombres” en Editar del mandato antes de generar el informe. Tanto el PDF como la vista pública ocultarán los nombres.'),

    // 17. GLOSARIO
    section(17, 'Referencia', 'Glosario'),
    kvTable([
      ['Mandato', 'Búsqueda concreta para un cliente (la posición a cubrir).'],
      ['Vertical', 'Tipo de posición o práctica (CMO, CFO, CEO/DG, etc.).'],
      ['Pipeline', 'Tablero Kanban con las etapas por las que avanza un candidato.'],
      ['Etapa', 'Columna del pipeline; puede ser intermedia o final (terminal).'],
      ['Dimensión', 'Criterio con el que se puntúa a un candidato (0–100).'],
      ['Métrica destacada', 'Dato de impacto de la trayectoria del candidato.'],
      ['Observación', 'Nota cualitativa: fortaleza o punto a explorar.'],
      ['Informe', 'Documento ejecutivo (versión congelada) para el cliente.'],
      ['Enlace público', 'URL con token, caducidad y revocable para ver un informe sin cuenta.'],
      ['Plantilla', 'Conjunto reutilizable de etapas de pipeline.'],
      ['Socio', 'Usuario consultor asignado a mandatos (rol estándar).'],
      ['RGPD', 'Consentimiento del candidato para el tratamiento de sus datos.'],
    ]),
    e(View, { style: s.hair }),
    e(
      Text,
      { style: [s.para, { textAlign: 'center', color: C.slateSoft, fontFamily: HO, marginTop: 6 }] },
      t('TheHunter.tech — Manual de usuario · Documento confidencial de uso interno'),
    ),
  ];

  // El cuerpo es una única Page que se pagina sola. Nota: en @react-pdf, un pie
  // `fixed` con `render` dinámico (pageNumber/totalPages) sobre una Page que se
  // extiende a muchas páginas dispara un overflow de transform. Por eso el pie es
  // estático (sin numeración dinámica) y la marca de agua SVG queda en portada/índice.
  const cuerpo = e(Page, { size: 'A4', style: s.page }, header(), footerBody(), ...bloques);

  const doc = e(
    Document,
    { title: 'Manual de usuario — TheHunter.tech', author: 'TheHunter.tech' },
    portada,
    indice,
    cuerpo,
  );

  const salida = path.resolve(__dirname, '../../../Documentacion funcional/Manual-de-usuario-TheHunter.pdf');
  await renderToFile(doc, salida);
  // eslint-disable-next-line no-console
  console.log('[manual] PDF generado en:', salida);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[manual] Error generando el PDF:', err);
  process.exit(1);
});
