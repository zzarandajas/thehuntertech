import React from 'react';
import type { SnapshotInforme } from '../models/Informe';

const e = React.createElement;

// Genera el PDF del informe a partir del snapshot inmutable (sin Chromium).
// @react-pdf/renderer se importa de forma perezosa (es ESM): así el resto de la app
// (y los tests) no lo cargan salvo cuando realmente se genera un PDF.
export async function generarPdfInforme(snapshot: SnapshotInforme): Promise<Buffer> {
  const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import(
    '@react-pdf/renderer'
  );

  const styles = StyleSheet.create({
    page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
    h1: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    sub: { fontSize: 11, color: '#334155', marginBottom: 2 },
    conf: { fontSize: 8, color: '#64748b', marginBottom: 16 },
    card: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 12, marginBottom: 12 },
    h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    etapa: { fontSize: 9, color: '#0369a1', marginBottom: 6 },
    score: { fontSize: 10, marginBottom: 2 },
    label: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 6, marginBottom: 2 },
    li: { fontSize: 10, marginBottom: 1 },
    footer: { marginTop: 16, fontSize: 8, color: '#94a3b8' },
  });

  const proceso = snapshot.proceso ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidatos: any[] = snapshot.candidatos ?? [];

  const tarjetas = candidatos.map((c, i) => {
    const hijos: React.ReactNode[] = [
      e(Text, { key: 'n', style: styles.h2 }, c.nombre),
      e(Text, { key: 'et', style: styles.etapa }, `Etapa: ${c.etapa}`),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c.scores ?? []).forEach((s: any, j: number) => {
      hijos.push(e(Text, { key: `s${j}`, style: styles.score }, `${s.dimension}: ${s.score}/100`));
    });
    if ((c.observaciones?.fortalezas ?? []).length) {
      hijos.push(e(Text, { key: 'lf', style: styles.label }, 'Fortalezas'));
      c.observaciones.fortalezas.forEach((f: string, j: number) => {
        hijos.push(e(Text, { key: `f${j}`, style: styles.li }, `• ${f}`));
      });
    }
    if ((c.observaciones?.puntosExplorar ?? []).length) {
      hijos.push(e(Text, { key: 'lp', style: styles.label }, 'Puntos a explorar'));
      c.observaciones.puntosExplorar.forEach((f: string, j: number) => {
        hijos.push(e(Text, { key: `p${j}`, style: styles.li }, `• ${f}`));
      });
    }
    return e(View, { key: i, style: styles.card, wrap: false }, ...hijos);
  });

  const doc = e(
    Document,
    {},
    e(
      Page,
      { size: 'A4', style: styles.page },
      e(Text, { style: styles.h1 }, proceso.titulo ?? 'Informe'),
      e(Text, { style: styles.sub }, `${proceso.cliente ?? ''} · ${proceso.vertical ?? ''}`),
      e(Text, { style: styles.conf }, proceso.confidencialidad ?? ''),
      ...tarjetas,
      e(
        Text,
        { style: styles.footer },
        `Generado el ${new Date(snapshot.generadoEl ?? Date.now()).toLocaleString('es-ES')}`,
      ),
    ),
  );

  return renderToBuffer(doc);
}
