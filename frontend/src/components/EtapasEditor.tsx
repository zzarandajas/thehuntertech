import { useEffect, useRef, useState } from 'react';
import { App as AntApp, Button, Checkbox, ColorPicker, Input, Modal, Popconfirm, Tooltip, Typography } from 'antd';
import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

const COLOR_DEFAULT = '#64748b';

// Forma de una etapa editable, común a plantillas y a etapas por mandato.
export interface EtapaEditable {
  id?: number;
  nombre: string;
  color: string;
  esFinal: boolean;
}

interface FilaEtapa extends EtapaEditable {
  key: string;
}

interface EtapasEditorProps {
  open: boolean;
  title: string;
  etapas: EtapaEditable[];
  onCancel: () => void;
  onGuardar: (etapas: EtapaEditable[]) => void | Promise<void>;
  // Nº de candidatos por etapa (solo etapas de mandato); muestra aviso al borrar.
  conteo?: (id?: number) => number;
  nota?: string;
  guardando?: boolean;
}

// Editor reutilizable de un conjunto ordenado de etapas: añadir / renombrar /
// recolorear / marcar final / reordenar (drag & drop) / borrar.
export default function EtapasEditor({
  open,
  title,
  etapas,
  onCancel,
  onGuardar,
  conteo,
  nota,
  guardando,
}: EtapasEditorProps) {
  const { message } = AntApp.useApp();
  const [filas, setFilas] = useState<FilaEtapa[]>([]);
  const contador = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (open) {
      setFilas(etapas.map((e, i) => ({ ...e, key: e.id ? `e-${e.id}` : `init-${i}` })));
    }
  }, [open, etapas]);

  const actualizar = (key: string, cambios: Partial<FilaEtapa>) =>
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)));

  const añadir = () => {
    contador.current += 1;
    setFilas((prev) => [
      ...prev,
      { key: `new-${contador.current}`, nombre: '', color: COLOR_DEFAULT, esFinal: false },
    ]);
  };

  const borrar = (key: string) => setFilas((prev) => prev.filter((f) => f.key !== key));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFilas((prev) => {
      const oldIndex = prev.findIndex((f) => f.key === active.id);
      const newIndex = prev.findIndex((f) => f.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const guardar = () => {
    const limpias = filas.map((f) => ({ ...f, nombre: f.nombre.trim() }));
    if (limpias.length === 0) {
      message.error('Debe haber al menos una etapa');
      return;
    }
    if (limpias.some((f) => !f.nombre)) {
      message.error('Todas las etapas necesitan un nombre');
      return;
    }
    onGuardar(
      limpias.map((f) => ({ id: f.id, nombre: f.nombre, color: f.color, esFinal: f.esFinal })),
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={guardar}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={guardando}
      width={560}
      destroyOnClose
    >
      {nota && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {nota}
        </Text>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <SortableContext items={filas.map((f) => f.key)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filas.map((fila) => (
              <FilaEtapaEditor
                key={fila.key}
                fila={fila}
                candidatos={conteo ? conteo(fila.id) : 0}
                puedeBorrar={filas.length > 1}
                onActualizar={actualizar}
                onBorrar={borrar}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={añadir}
        block
        style={{ marginTop: 12 }}
      >
        Añadir etapa
      </Button>
    </Modal>
  );
}

interface FilaEtapaEditorProps {
  fila: FilaEtapa;
  candidatos: number;
  puedeBorrar: boolean;
  onActualizar: (key: string, cambios: Partial<FilaEtapa>) => void;
  onBorrar: (key: string) => void;
}

function FilaEtapaEditor({
  fila,
  candidatos,
  puedeBorrar,
  onActualizar,
  onBorrar,
}: FilaEtapaEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fila.key,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    border: '1px solid #f0f0f0',
    borderRadius: 8,
    background: '#fff',
  };
  return (
    <div ref={setNodeRef} style={style}>
      <span
        {...attributes}
        {...listeners}
        aria-label="Reordenar etapa"
        style={{ cursor: 'grab', touchAction: 'none', color: '#94a3b8', display: 'inline-flex' }}
      >
        <HolderOutlined />
      </span>
      <ColorPicker
        value={fila.color}
        onChange={(_, hex) => onActualizar(fila.key, { color: hex })}
        size="small"
      />
      <Input
        placeholder="Nombre de la etapa"
        value={fila.nombre}
        onChange={(e) => onActualizar(fila.key, { nombre: e.target.value })}
        style={{ flex: 1 }}
      />
      <Tooltip title="Etapa final (los candidatos aquí no cuentan como estancados)">
        <Checkbox
          checked={fila.esFinal}
          onChange={(e) => onActualizar(fila.key, { esFinal: e.target.checked })}
        >
          Final
        </Checkbox>
      </Tooltip>
      <Popconfirm
        title={
          candidatos > 0
            ? `${candidatos} candidato(s) pasarán a la primera etapa. ¿Borrar?`
            : '¿Borrar esta etapa?'
        }
        okText="Borrar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        onConfirm={() => onBorrar(fila.key)}
        disabled={!puedeBorrar}
      >
        <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={!puedeBorrar} />
      </Popconfirm>
    </div>
  );
}
