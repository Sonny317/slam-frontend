// src/pages/AdminStaffInfoPage.jsx
import React from 'react';

// 가짜 데이터
const staffList = [
  { id: 1, name: 'Sonny', role: 'President', branch: 'All', email: 'sonny@example.com' },
  { id: 2, name: 'Alice', role: 'EP Leader', branch: 'NCCU', email: 'alice@example.com' },
  { id: 3, name: 'Bob', role: 'PR Staff', branch: 'NTU', email: 'bob@example.com' },
];

export default function AdminStaffInfoPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Staff Info</h1>
        <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
          Add New Staff
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map(staff => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{staff.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{staff.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap">{staff.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
