import { Card, Typography } from 'antd';

const { Text } = Typography;

interface Observacion {
  tipo: 'fortaleza' | 'punto_explorar';
  texto: string;
}

// Dos columnas: Fortalezas (verde) / Puntos a explorar (ámbar). Reutilizable en el informe.
export default function FortalezasTable({ observaciones }: { observaciones: Observacion[] }) {
  const fortalezas = observaciones.filter((o) => o.tipo === 'fortaleza');
  const puntos = observaciones.filter((o) => o.tipo === 'punto_explorar');

  const lista = (items: Observacion[]) =>
    items.length ? (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((o, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {o.texto}
          </li>
        ))}
      </ul>
    ) : (
      <Text type="secondary">—</Text>
    );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Card size="small" title="Fortalezas" styles={{ header: { background: '#dcfce7' } }}>
        {lista(fortalezas)}
      </Card>
      <Card size="small" title="Puntos a explorar" styles={{ header: { background: '#fef3c7' } }}>
        {lista(puntos)}
      </Card>
    </div>
  );
}
