// src/pages/AdminActionPlanPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from '../api/axios';

const TEAMS = ['GA', 'PR', 'EP'];

const COLOR_OPTIONS = [
  { name: 'Black', value: '#111827' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Purple', value: '#7c3aed' },
];

function Toolbar({ onCmd, onColor, onInsertCheckbox, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 bg-white">
      <button type="button" onClick={() => onCmd('bold')} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">B</button>
      <button type="button" onClick={() => onCmd('italic')} className="px-2 py-1 text-sm border rounded hover:bg-gray-100 italic">I</button>
      <button type="button" onClick={() => onCmd('underline')} className="px-2 py-1 text-sm border rounded hover:bg-gray-100 underline">U</button>
      <button type="button" onClick={() => onCmd('insertUnorderedList')} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">• List</button>
      <button type="button" onClick={() => onCmd('insertOrderedList')} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">1. List</button>
      <div className="flex items-center gap-1">
        {COLOR_OPTIONS.map(c => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            onClick={() => onColor(c.value)}
            className="w-6 h-6 rounded-full border hover:ring-2 hover:ring-offset-1"
            style={{ backgroundColor: c.value, borderColor: '#e5e7eb' }}
          />
        ))}
      </div>
      <button type="button" onClick={onInsertCheckbox} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">☑ Add checkbox</button>
      <button type="button" onClick={onClear} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">Clear format</button>
    </div>
  );
}

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const composingRef = useRef(false);
  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    handleInput();
  };
  const handleInput = () => {
    if (ref.current && !composingRef.current) {
      onChange(ref.current.innerHTML);
    }
  };
  // Sync external value into editor without breaking IME
  React.useEffect(() => {
    if (ref.current && typeof value === 'string' && !composingRef.current) {
      // Only update if different to avoid caret jumps
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value;
      }
    }
  }, [value]);
  const handleColor = (color) => exec('foreColor', color);
  const handleInsertCheckbox = () => {
    if (!ref.current) return;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const label = document.createElement('span');
    label.innerHTML = '&nbsp;';
    const wrapper = document.createElement('div');
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.insertNode(wrapper);
    } else {
      ref.current.appendChild(wrapper);
    }
    handleInput();
  };
  const handleClear = () => exec('removeFormat');
  return (
    <div className="space-y-2">
      <Toolbar onCmd={exec} onColor={handleColor} onInsertCheckbox={handleInsertCheckbox} onClear={handleClear} />
      <div
        ref={ref}
        className="min-h-[160px] p-3 border rounded-md bg-white focus:outline-none text-left"
        dir="ltr"
        style={{ unicodeBidi: 'plaintext', whiteSpace: 'pre-wrap' }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { composingRef.current = true; }}
        onCompositionEnd={() => { composingRef.current = false; handleInput(); }}
        onFocus={() => {
          if (!ref.current) return;
          const range = document.createRange();
          range.selectNodeContents(ref.current);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }}
      />
    </div>
  );
}

function TaskCard({ task, onDragStart, onOpen, selected, onSelectToggle }) {
  const teamColor = task.team === 'GA' ? 'bg-purple-100 text-purple-700' : task.team === 'PR' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  return (
    <div
      className="bg-white p-4 rounded-md shadow-sm mb-4 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <input type="checkbox" checked={!!selected} onChange={(e) => { e.stopPropagation(); onSelectToggle(task.id); }} onClick={(e) => e.stopPropagation()} />
          <p className="font-semibold text-gray-800">{task.title}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${teamColor}`}>{task.team}</span>
      </div>
    <div className="text-xs text-gray-500 mt-2">
        <span>Due: {task.deadline}</span>
        {task.createdAt && (
          <span className="ml-2">• Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        )}
      </div>
      {task.agenda && (
        <div className="prose max-w-none mt-3 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: task.agenda }} />
      )}
      {/* Acknowledgements */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {(task.acks || []).slice(0, 6).map((u) => (
            <img key={u.id} src={u.avatar || '/default_profile.jpg'} alt={u.name} title={u.name} className="w-6 h-6 rounded-full border-2 border-white object-cover" />
          ))}
          {(task.acks || []).length > 6 && (
            <span className="text-xs text-gray-500 ml-2">+{(task.acks || []).length - 6}</span>
          )}
        </div>
    </div>
  </div>
);
}

export default function AdminActionPlanPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [branch, setBranch] = useState('NCCU');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', team: 'GA', deadline: '', agenda: '', eventTitle: '' });
  const [detailTask, setDetailTask] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => { setIsModalOpen(false); setForm({ title: '', team: 'GA', deadline: '', agenda: '', eventTitle: '' }); };
  const handleSave = () => {
    if (!form.title || !form.deadline) { alert('Title and Deadline are required.'); return; }
    axios.post('/api/admin/actions', {
      title: form.title,
      team: form.team,
      agenda: form.agenda,
      deadline: form.deadline,
      status: 'todo',
      branch,
      eventTitle: form.eventTitle
    }).then(res => {
      setTasks(prev => [res.data, ...prev]);
      handleCloseModal();
    }).catch(err => alert(err?.response?.data || 'Failed to create task'));
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', String(id));
  };
  const onDropTo = (status) => (e) => {
    const id = Number(e.dataTransfer.getData('text/plain'));
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    axios.put(`/api/admin/actions/${id}`, { ...target, status })
      .then(res => setTasks(prev => prev.map(t => t.id === id ? res.data : t)))
      .catch(() => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))); // optimistic
  };
  const allowDrop = (e) => e.preventDefault();

  const column = (title, status, bg) => (
    <div className={`${bg} p-4 rounded-lg min-h-[320px]`} onDragOver={allowDrop} onDrop={onDropTo(status)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">{title} ({tasks.filter(t => t.status === status).length})</h2>
      </div>
      {tasks.filter(t => t.status === status).map(task => (
        <TaskCard key={task.id} task={task} onDragStart={onDragStart} onOpen={(t) => setDetailTask(t)} selected={selectedIds.has(task.id)} onSelectToggle={(id) => {
          setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
          });
        }} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* load tasks */}
        <TasksLoader branch={branch} onLoad={setTasks} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Action Plan</h1>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="NCCU">NCCU</option>
              <option value="NTU">NTU</option>
              <option value="TAIPEI">TAIPEI</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => {
                  if (!window.confirm(`Delete ${selectedIds.size} selected tasks?`)) return;
                  const ids = Array.from(selectedIds);
                  Promise.all(ids.map(id => axios.delete(`/api/admin/actions/${id}`)))
                    .then(() => {
                      setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
                      setSelectedIds(new Set());
                    })
                    .catch(() => alert('Failed to delete some tasks'));
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Selected ({selectedIds.size})
              </button>
            )}
            <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">+ New Task</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 sm:gap-6">
          {column('To Do', 'todo', 'bg-gray-100')}
          {column('In Progress', 'inProgress', 'bg-gray-100')}
          {column('Done', 'done', 'bg-gray-100')}
          {column('Archive', 'archive', 'bg-gray-100')}
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create Task</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Title</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Task title" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Team</label>
                <select value={form.team} onChange={(e) => setForm(f => ({ ...f, team: e.target.value }))} className="w-full p-2 border rounded-md">
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Event</label>
                <input value={form.eventTitle} onChange={(e) => setForm(f => ({ ...f, eventTitle: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Related event title (optional)" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-600">Agenda</label>
              <RichEditor value={form.agenda} onChange={(html) => setForm(f => ({ ...f, agenda: html }))} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={handleCloseModal} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {detailTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{detailTask.title}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  Team: {detailTask.team} • Due: {detailTask.deadline}
                  {detailTask.createdAt && (
                    <> • Created: {new Date(detailTask.createdAt).toLocaleString()}</>
                  )}
                </div>
              </div>
              <button onClick={() => setDetailTask(null)} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
            {detailTask.agenda && (
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: detailTask.agenda }} />
            )}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {(detailTask.acks || []).map((u) => (
                  <img key={u.id} src={u.avatar || '/default_profile.jpg'} alt={u.name} title={u.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
        </div>
              <button
                onClick={() => {
                  if (!user?.isLoggedIn) { alert('Login required'); return; }
                  const current = { id: user.email || 'me', name: user.name || 'Me', avatar: user.profileImage };
                  axios.post(`/api/admin/actions/${detailTask.id}/ack-toggle`).then(res => {
                    setTasks(prev => prev.map(t => t.id === detailTask.id ? res.data : t));
                    setDetailTask(res.data);
                  }).catch(() => {
                    // fallback local toggle
                    setTasks(prev => prev.map(t => {
                      if (t.id !== detailTask.id) return t;
                      const has = (t.acks || []).some(a => a.id === current.id);
                      const acks = has ? t.acks.filter(a => a.id !== current.id) : [...(t.acks || []), current];
                      const updated = { ...t, acks };
                      setDetailTask(updated);
                      return updated;
                    }));
                  });
                }}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                {(detailTask.acks || []).some(a => a.id === (user?.email || 'me')) ? 'Unacknowledge' : 'Acknowledge'}
              </button>
        </div>
      </div>
        </div>
      )}
      </div>
    </div>
  );
}

function TasksLoader({ branch, onLoad }) {
  useEffect(() => {
    let mounted = true;
    axios.get('/api/admin/actions', { params: { branch } }).then(res => { if (mounted) onLoad(res.data || []); });
    return () => { mounted = false; };
  }, [onLoad, branch]);
  return null;
}
// src/pages/AdminActionPlanPage.jsx