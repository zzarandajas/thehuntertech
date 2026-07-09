interface Observacion {
  tipo: 'fortaleza' | 'punto_explorar';
  texto: string;
}

const PANELS = {
  fortaleza: { bg: '#F0FDF4', border: '#BBF7D0', ink: '#166534', titulo: 'Fortalezas' },
  punto_explorar: { bg: '#EFF6FF', border: '#BFDBFE', ink: '#1E3A8A', titulo: 'Puntos a explorar' },
} as const;

function Panel({ tipo, items }: { tipo: keyof typeof PANELS; items: Observacion[] }) {
  const p = PANELS[tipo];
  return (
    <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700, color: p.ink, marginBottom: 10, fontSize: 14 }}>{p.titulo}</div>
      {items.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: p.ink, lineHeight: 1.5 }}>•</span>
              <span style={{ color: '#334155', fontSize: 13, lineHeight: 1.5 }}>{o.texto}</span>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ color: '#94A3B8' }}>—</span>
      )}
    </div>
  );
}

// Dos columnas: Fortalezas (verde) / Puntos a explorar (azul). Coherente con el PDF.
export default function FortalezasTable({ observaciones }: { observaciones: Observacion[] }) {
  const fortalezas = observaciones.filter((o) => o.tipo === 'fortaleza');
  const puntos = observaciones.filter((o) => o.tipo === 'punto_explorar');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}
    >
      <Panel tipo="fortaleza" items={fortalezas} />
      <Panel tipo="punto_explorar" items={puntos} />
    </div>
  );
}
