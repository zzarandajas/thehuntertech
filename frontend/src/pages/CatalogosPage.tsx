import { Card, Tabs, Typography } from 'antd';
import CatalogoTab, { type CampoCatalogo } from '../components/CatalogoTab';
import { useAuth } from '../auth/AuthContext';

const { Title } = Typography;

const CAMPOS_DIMENSION: CampoCatalogo[] = [
  { name: 'codigo', label: 'Código', requerido: true },
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'categoria', label: 'Categoría' },
  { name: 'orden', label: 'Orden', tipo: 'number' },
  { name: 'descripcion', label: 'Descripción', tipo: 'textarea' },
];

const CAMPOS_VERTICAL: CampoCatalogo[] = [
  { name: 'codigo', label: 'Código', requerido: true },
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'descripcion', label: 'Descripción', tipo: 'textarea' },
];

const CAMPOS_SKILL: CampoCatalogo[] = [
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'categoria', label: 'Categoría' },
];

const CAMPOS_ORIGEN: CampoCatalogo[] = [{ name: 'nombre', label: 'Nombre', requerido: true }];

export default function CatalogosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        Catálogos
      </Title>
      <Tabs
        items={[
          {
            key: 'dimensiones',
            label: 'Dimensiones',
            children: <CatalogoTab ruta="dimensiones" campos={CAMPOS_DIMENSION} esAdmin={esAdmin} />,
          },
          {
            key: 'verticales',
            label: 'Verticales',
            children: <CatalogoTab ruta="verticales" campos={CAMPOS_VERTICAL} esAdmin={esAdmin} />,
          },
          {
            key: 'skills',
            label: 'Skills',
            children: <CatalogoTab ruta="skills" campos={CAMPOS_SKILL} esAdmin={esAdmin} />,
          },
          {
            key: 'origenes',
            label: 'Orígenes',
            children: <CatalogoTab ruta="origenes" campos={CAMPOS_ORIGEN} esAdmin={esAdmin} />,
          },
        ]}
      />
    </Card>
  );
}
