import { Progress, Typography } from 'antd';

const { Text } = Typography;

// Barra de puntuación (0-100) de una dimensión. Reutilizable en drawer e informe.
export default function DimensionScoreBar({
  nombre,
  score,
  comentario,
}: {
  nombre: string;
  score: number;
  comentario?: string | null;
}) {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text strong>{nombre}</Text>
        <Text strong style={{ color }}>
          {score}
        </Text>
      </div>
      <Progress percent={score} showInfo={false} strokeColor={color} />
      {comentario && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {comentario}
        </Text>
      )}
    </div>
  );
}
