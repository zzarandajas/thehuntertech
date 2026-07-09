import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App as AntApp,
  Button,
  Card,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  HolderOutlined,
  SettingOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProcesoCandidatoDrawer from '../components/ProcesoCandidatoDrawer';
import {
  actualizarProcesoCandidato,
  agregarCandidatoAPipeline,
  eliminarProcesoCandidato,
  obtenerPipeline,
  obtenerEtapasProceso,
  reemplazarEtapasProceso,
  ETAPA_COLOR_DEFAULT,
  type EtapaProceso,
  type ProcesoCandidato,
} from '../api/pipeline';
import { obtenerMandato } from '../api/mandatos';
import { listarCandidatos, type Candidato } from '../api/talento';
import EtapasEditor, { type EtapaEditable } from '../components/EtapasEditor';

const { Title, Text } = Typography;

// Columnas del board indexadas por id de etapa (number).
type Columnas = Record<number, number[]>;

const colId = (etapaId: number) => `col:${etapaId}`;

// Localiza el id de etapa donde vive un id arrastrable. Puede ser el de una
// tarjeta (number) o el de una columna droppable ("col:<id>").
function etapaDeId(id: UniqueIdentifier, columnas: Columnas): number | undefined {
  if (typeof id === 'string' && id.startsWith('col:')) return Number(id.slice(4));
  const num = Number(id);
  return Object.keys(columnas)
    .map(Number)
    .find((eid) => columnas[eid].includes(num));
}

export default function PipelineBoardPage() {
  const { id } = useParams<{ id: string }>();
  const procesoId = Number(id);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [itemsById, setItemsById] = useState<Record<number, ProcesoCandidato>>({});
  const [etapas, setEtapas] = useState<EtapaProceso[]>([]);
  const [columnas, setColumnas] = useState<Columnas>({});
  const [titulo, setTitulo] = useState('');
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aAgregar, setAAgregar] = useState<number | undefined>();
  const [evalPcId, setEvalPcId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [guardandoEtapas, setGuardandoEtapas] = useState(false);

  // Snapshot de las columnas al iniciar el arrastre, para diffear y persistir
  // solo las tarjetas cuya etapa u orden hayan cambiado.
  const inicioArrastre = useRef<Columnas | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cargar = async () => {
    setCargando(true);
    try {
      const [pipe, mandato, cands, etapasProceso] = await Promise.all([
        obtenerPipeline(procesoId),
        obtenerMandato(procesoId),
        listarCandidatos(),
        obtenerEtapasProceso(procesoId),
      ]);
      const byId: Record<number, ProcesoCandidato> = {};
      const cols: Columnas = {};
      etapasProceso.forEach((e) => {
        cols[e.id] = [];
      });
      const primeraId = etapasProceso[0]?.id;
      // pipe viene ordenado por `orden` ASC, asÃ­ que el push preserva el orden.
      pipe.forEach((pc) => {
        byId[pc.id] = pc;
        const destino = cols[pc.etapaId] ? pc.etapaId : primeraId;
        if (destino != null) cols[destino].push(pc.id);
      });
      setItemsById(byId);
      setEtapas(etapasProceso);
      setColumnas(cols);
      setTitulo(mandato.titulo);
      setCandidatos(cands);
    } catch {
      message.error('No se pudo cargar el pipeline');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procesoId]);

  // Persiste el diff entre dos estados de columnas: PATCH { etapaId, orden }
  // para cada tarjeta que haya cambiado de columna o de posiciÃ³n.
  const persistirCambios = (antes: Columnas, despues: Columnas) => {
    const posicionAntes = (cardId: number) => {
      for (const e of etapas) {
        const idx = antes[e.id]?.indexOf(cardId) ?? -1;
        if (idx !== -1) return { etapaId: e.id, orden: idx };
      }
      return null;
    };
    const promesas: Promise<unknown>[] = [];
    etapas.forEach((e) => {
      (despues[e.id] ?? []).forEach((cardId, orden) => {
        const prev = posicionAntes(cardId);
        if (!prev || prev.etapaId !== e.id || prev.orden !== orden) {
          promesas.push(actualizarProcesoCandidato(cardId, { etapaId: e.id, orden }));
        }
      });
    });
    if (promesas.length) {
      Promise.all(promesas).catch(() => {
        message.error('No se pudo guardar el nuevo orden');
        cargar();
      });
    }
  };

  const quitar = async (pc: ProcesoCandidato) => {
    const etapaId = etapaDeId(pc.id, columnas);
    try {
      await eliminarProcesoCandidato(pc.id);
      if (etapaId != null) {
        setColumnas((prev) => ({
          ...prev,
          [etapaId]: prev[etapaId].filter((x) => x !== pc.id),
        }));
      }
      setItemsById((prev) => {
        const next = { ...prev };
        delete next[pc.id];
        return next;
      });
    } catch {
      message.error('No se pudo quitar el candidato');
    }
  };

  const agregar = async () => {
    if (!aAgregar) return;
    try {
      await agregarCandidatoAPipeline(procesoId, aAgregar);
      setAAgregar(undefined);
      await cargar();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) message.warning('El candidato ya estÃ¡ en el pipeline');
      else message.error('No se pudo aÃ±adir el candidato');
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    inicioArrastre.current = columnas;
    setActiveId(Number(event.active.id));
  };

  // Movimiento entre columnas en tiempo real mientras se arrastra.
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const origen = etapaDeId(active.id, columnas);
    const destino = etapaDeId(over.id, columnas);
    if (origen == null || destino == null || origen === destino) return;

    const cardId = Number(active.id);
    setColumnas((prev) => {
      const itemsDestino = prev[destino] ?? [];
      const esColumna = typeof over.id === 'string' && over.id.startsWith('col:');
      const overIndex = esColumna ? itemsDestino.length : itemsDestino.indexOf(Number(over.id));
      const insertar = overIndex >= 0 ? overIndex : itemsDestino.length;
      return {
        ...prev,
        [origen]: prev[origen].filter((x) => x !== cardId),
        [destino]: [...itemsDestino.slice(0, insertar), cardId, ...itemsDestino.slice(insertar)],
      };
    });
    setItemsById((prev) => ({ ...prev, [cardId]: { ...prev[cardId], etapaId: destino } }));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const antes = inicioArrastre.current;
    inicioArrastre.current = null;
    setActiveId(null);
    if (!over || !antes) return;

    const etapaId = etapaDeId(over.id, columnas);
    const cardId = Number(active.id);
    let despues = columnas;

    if (etapaId != null) {
      const items = columnas[etapaId];
      const oldIndex = items.indexOf(cardId);
      const esColumna = typeof over.id === 'string' && over.id.startsWith('col:');
      const newIndex = esColumna ? items.length - 1 : items.indexOf(Number(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        despues = { ...columnas, [etapaId]: arrayMove(items, oldIndex, newIndex) };
        setColumnas(despues);
      }
    }
    persistirCambios(antes, despues);
  };

  const guardarEtapas = async (nuevas: EtapaEditable[]) => {
    setGuardandoEtapas(true);
    try {
      await reemplazarEtapasProceso(procesoId, nuevas);
      setEditorAbierto(false);
      message.success('Etapas actualizadas');
      await cargar();
    } catch {
      message.error('No se pudieron guardar las etapas');
    } finally {
      setGuardandoEtapas(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const candidatosDisponibles = candidatos.filter(
    (c) => !Object.values(itemsById).some((pc) => pc.candidatoId === c.id),
  );

  const activePc = activeId != null ? itemsById[activeId] : null;
  const activeEtapaId = activePc ? etapaDeId(activePc.id, columnas) : undefined;
  const activeColor = etapas.find((e) => e.id === activeEtapaId)?.color ?? ETAPA_COLOR_DEFAULT;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start" wrap>
          <Space direction="vertical" size={0}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ paddingLeft: 0 }}
              onClick={() => navigate(`/mandatos/${procesoId}`)}
            >
              {titulo || 'Mandato'}
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Pipeline
            </Title>
          </Space>
          <Space wrap>
            <Select
              style={{ minWidth: 260 }}
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="AÃ±adir candidato al pipeline"
              value={aAgregar}
              onChange={setAAgregar}
              options={candidatosDisponibles.map((c) => ({ value: c.id, label: c.nombre }))}
            />
            <Button type="primary" onClick={agregar} disabled={!aAgregar}>
              AÃ±adir
            </Button>
            <Tooltip title="Editar etapas del pipeline">
              <Button icon={<SettingOutlined />} onClick={() => setEditorAbierto(true)}>
                Etapas
              </Button>
            </Tooltip>
          </Space>
        </Space>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', gap: 12, minWidth: 'min-content' }}>
            {etapas.map((etapa) => (
              <Columna
                key={etapa.id}
                etapa={etapa}
                cardIds={columnas[etapa.id] ?? []}
                itemsById={itemsById}
                onOpenCandidato={(candidatoId) => navigate(`/talento/${candidatoId}`)}
                onEvaluar={setEvalPcId}
                onQuitar={quitar}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activePc ? <TarjetaOverlay pc={activePc} color={activeColor} /> : null}
        </DragOverlay>
      </DndContext>

      <ProcesoCandidatoDrawer
        procesoCandidatoId={evalPcId}
        open={evalPcId !== null}
        onClose={() => setEvalPcId(null)}
      />

      <EtapasEditor
        open={editorAbierto}
        title="Etapas del pipeline"
        etapas={etapas.map((e) => ({
          id: e.id,
          nombre: e.nombre,
          color: e.color,
          esFinal: e.esFinal,
        }))}
        conteo={(eid) => (eid != null ? columnas[eid]?.length ?? 0 : 0)}
        nota="Arrastra para reordenar. Al borrar una etapa con candidatos, estos pasan a la primera etapa."
        guardando={guardandoEtapas}
        onCancel={() => setEditorAbierto(false)}
        onGuardar={guardarEtapas}
      />
    </Space>
  );
}

interface ColumnaProps {
  etapa: EtapaProceso;
  cardIds: number[];
  itemsById: Record<number, ProcesoCandidato>;
  onOpenCandidato: (candidatoId: number) => void;
  onEvaluar: (pcId: number) => void;
  onQuitar: (pc: ProcesoCandidato) => void;
}

function Columna({ etapa, cardIds, itemsById, onOpenCandidato, onEvaluar, onQuitar }: ColumnaProps) {
  // La columna es droppable para poder soltar en columnas vacÃ­as.
  const { setNodeRef, isOver } = useDroppable({ id: colId(etapa.id) });
  return (
    <div style={{ width: 240, flex: '0 0 240px' }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: etapa.color,
                display: 'inline-block',
                flex: '0 0 auto',
              }}
            />
            <Text strong>{etapa.nombre}</Text>
            <Tag>{cardIds.length}</Tag>
          </Space>
        }
        styles={{
          header: { borderTop: `3px solid ${etapa.color}` },
          body: {
            background: isOver ? '#eef2ff' : '#f8fafc',
            minHeight: 120,
            transition: 'background 150ms ease',
          },
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {cardIds.map((cardId) => {
                const pc = itemsById[cardId];
                if (!pc) return null;
                return (
                  <TarjetaCandidato
                    key={cardId}
                    pc={pc}
                    color={etapa.color}
                    onOpenCandidato={onOpenCandidato}
                    onEvaluar={onEvaluar}
                    onQuitar={onQuitar}
                  />
                );
              })}
            </Space>
          </div>
        </SortableContext>
      </Card>
    </div>
  );
}

interface TarjetaProps {
  pc: ProcesoCandidato;
  color: string;
  onOpenCandidato: (candidatoId: number) => void;
  onEvaluar: (pcId: number) => void;
  onQuitar: (pc: ProcesoCandidato) => void;
}

function TarjetaCandidato({ pc, color, onOpenCandidato, onEvaluar, onQuitar }: TarjetaProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pc.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        styles={{ body: { padding: 10 } }}
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Space size={4} align="center" style={{ width: '100%' }}>
            <span
              {...attributes}
              {...listeners}
              aria-label={`Arrastrar ${pc.candidato?.nombre ?? 'candidato'}`}
              style={{
                cursor: 'grab',
                touchAction: 'none',
                color: '#94a3b8',
                display: 'inline-flex',
                padding: '4px 2px',
              }}
            >
              <HolderOutlined />
            </span>
            <Button
              type="link"
              style={{ padding: 0, height: 'auto', textAlign: 'left', flex: 1 }}
              onClick={() => onOpenCandidato(pc.candidatoId)}
            >
              {pc.candidato?.nombre}
            </Button>
          </Space>
          <Space size={4} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button size="small" icon={<SolutionOutlined />} onClick={() => onEvaluar(pc.id)}>
              Evaluar
            </Button>
            <Button
              size="small"
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onQuitar(pc)}
            />
          </Space>
        </Space>
      </Card>
    </div>
  );
}

// Vista compacta que sigue al cursor durante el arrastre.
function TarjetaOverlay({ pc, color }: { pc: ProcesoCandidato; color: string }) {
  return (
    <Card
      size="small"
      styles={{ body: { padding: 10 } }}
      style={{
        width: 220,
        borderLeft: `3px solid ${color}`,
        boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
        cursor: 'grabbing',
      }}
    >
      <Space size={6} align="center">
        <HolderOutlined style={{ color: '#94a3b8' }} />
        <Text strong>{pc.candidato?.nombre}</Text>
      </Space>
    </Card>
  );
}
