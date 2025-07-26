// src/pages/AdminActionPlanPage.jsx
import React from 'react';

// 가짜 데이터
const tasks = {
  todo: [{ id: 1, title: 'Plan next BBQ event', assigned: 'EP Team', due: '2025-08-15' }],
  inProgress: [{ id: 2, title: 'Design new Instagram post', assigned: 'PR Team', due: '2025-08-10' }],
  done: [{ id: 3, title: 'Approve new members', assigned: 'GA Team', due: '2025-08-01' }],
};

const TaskCard = ({ task }) => (
  <div className="bg-white p-4 rounded-md shadow-sm mb-4">
    <p className="font-semibold">{task.title}</p>
    <div className="text-xs text-gray-500 mt-2">
      <span>{task.assigned}</span> | <span>Due: {task.due}</span>
    </div>
  </div>
);

export default function AdminActionPlanPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Action Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4">To Do ({tasks.todo.length})</h2>
          {tasks.todo.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
        {/* In Progress Column */}
        <div className="bg-gray-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4">In Progress ({tasks.inProgress.length})</h2>
          {tasks.inProgress.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
        {/* Done Column */}
        <div className="bg-gray-200 p-4 rounded-lg">
          <h2 className="font-bold mb-4">Done ({tasks.done.length})</h2>
          {tasks.done.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </div>
    </div>
  );
}
// src/pages/AdminActionPlanPage.jsx