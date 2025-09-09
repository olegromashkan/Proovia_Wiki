'use client';

import { useState } from 'react';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  phone: string;
  position: string;
  managerId?: number | null;
}

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    if (editingId === null) {
      const newEmployee: Employee = {
        id: Date.now(),
        firstName: form.firstName,
        lastName: form.lastName,
        nickName: form.nickName || '',
        email: form.email || '',
        phone: form.phone || '',
        position: form.position || '',
        managerId: form.managerId ? Number(form.managerId) : null,
      };
      setEmployees(prev => [...prev, newEmployee]);
    } else {
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === editingId
            ? {
                ...emp,
                firstName: form.firstName || '',
                lastName: form.lastName || '',
                nickName: form.nickName || '',
                email: form.email || '',
                phone: form.phone || '',
                position: form.position || '',
                managerId: form.managerId ? Number(form.managerId) : null,
              }
            : emp,
        ),
      );
    }
    setForm({});
    setEditingId(null);
  };

  const handleEdit = (id: number) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    setForm(emp);
    setEditingId(id);
  };

  const renderTree = (managerId: number | null = null): JSX.Element | null => {
    const nodes = employees.filter(emp => (emp.managerId ?? null) === managerId);
    if (!nodes.length) return null;
    return (
      <ul className="ml-4 border-l pl-4">
        {nodes.map(node => (
          <li key={node.id} className="mb-2">
            <div className="flex items-center gap-2">
              <span>
                {node.firstName} {node.lastName} ({node.position})
              </span>
              <button
                onClick={() => handleEdit(node.id)}
                className="text-blue-600 underline text-sm"
              >
                edit
              </button>
            </div>
            {renderTree(node.id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Company Structure</h1>
      {renderTree(null)}

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-2">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="nickName"
          placeholder="Nickname"
          value={form.nickName || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="position"
          placeholder="Position"
          value={form.position || ''}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <select
          name="managerId"
          value={form.managerId ?? ''}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="">No Manager</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>
    </div>
  );
}

