'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';

export type PersonData = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  position: string;
  label?: string;
};

const initialNodes: Node<PersonData>[] = [];
const initialEdges: Edge[] = [];

const gridPosition = (index: number) => {
  const column = index % 3;
  const row = Math.floor(index / 3);
  return { x: column * 220, y: row * 140 };
};

function PersonNode({ data }: NodeProps<PersonData>) {
  return (
    <div className="rounded-md border bg-white p-2 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div className="font-medium leading-tight">
        {data.firstName} {data.lastName}
      </div>
      {data.position && (
        <div className="text-xs text-gray-500">{data.position}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { person: PersonNode } as const;

export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [form, setForm] = useState<PersonData & { id?: string }>({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    phone: '',
    position: '',
  });

  const onConnect = useCallback(
    (connection: Edge | Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  useEffect(() => {
    const saved = localStorage.getItem('org-chart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.nodes) setNodes(parsed.nodes);
      if (parsed.edges) setEdges(parsed.edges);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    localStorage.setItem('org-chart', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const onNodeClick = useCallback((_: unknown, node: Node<PersonData>) => {
    setForm({ id: node.id, ...node.data });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === form.id
            ? {
                ...n,
                type: 'person',
                data: { ...form, label: form.firstName + ' ' + form.lastName },
              }
            : n,
        ),
      );
    } else {
      const id = (nodes.length + 1).toString();
      setNodes((nds) =>
        nds.concat({
          id,
          type: 'person',
          position: gridPosition(nds.length),
          data: { ...form, label: form.firstName + ' ' + form.lastName },
        }),
      );
    }
    setForm({ firstName: '', lastName: '', nickname: '', email: '', phone: '', position: '' });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <form onSubmit={handleSubmit} className="space-y-2 lg:w-1/3">
        <input
          className="w-full rounded border p-2"
          placeholder="First name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Last name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Nickname"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Position"
          name="position"
          value={form.position}
          onChange={handleChange}
        />
        <button type="submit" className="rounded bg-brand px-4 py-2 text-white">
          {form.id ? 'Update' : 'Add'} person
        </button>
      </form>
      <div className="h-[500px] flex-1 border rounded">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
