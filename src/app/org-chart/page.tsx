'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface PersonData {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  position: string;
  label?: string;
}

export default function OrgChartPage() {
  const [nodes, setNodes] = useState<Node<PersonData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [form, setForm] = useState<PersonData>({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    phone: '',
    position: '',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      phone: '',
      position: '',
    });
    setSelectedId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = `${form.firstName} ${form.lastName}\n${form.position}`;
    if (selectedId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedId ? { ...n, data: { ...form, label } } : n
        )
      );
    } else {
      const id = crypto.randomUUID();
      setNodes((nds) => [
        ...nds,
        {
          id,
          position: { x: Math.random() * 250, y: Math.random() * 250 },
          data: { ...form, label },
        },
      ]);
    }
    resetForm();
  };

  const onNodeClick = (_: React.MouseEvent, node: Node<PersonData>) => {
    setSelectedId(node.id);
    const { label, ...rest } = node.data;
    void label;
    setForm(rest);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input
          className="border rounded p-2"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <input
          className="border rounded p-2"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
        <input
          className="border rounded p-2"
          placeholder="Nickname"
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
        />
        <input
          type="email"
          className="border rounded p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          required
        />
        <div className="flex gap-2 col-span-full">
          <button
            type="submit"
            className="px-4 py-2 bg-brand text-white rounded"
          >
            {selectedId ? 'Update Node' : 'Add Node'}
          </button>
          {selectedId && (
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="h-[60vh] border rounded">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

