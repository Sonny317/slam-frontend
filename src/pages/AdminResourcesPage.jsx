// src/pages/AdminResourcesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';

export default function AdminResourcesPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [resources, setResources] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    link: '',
    department: 'ALL',
    category: 'material'
  });

  // Rich text editor state
  const [isBold, setIsBold] = useState(false);
  const [isList, setIsList] = useState(false);

  // Rich text editor ref
  const editorRef = useRef(null);
  const composingRef = useRef(false);

  // Mock data - 실제로는 백엔드에서 가져올 데이터
  const mockResources = [
    { 
      id: 1, 
      title: 'Instagram & Google Drive', 
      description: 'Access main accounts and shared files.', 
      link: 'https://drive.google.com', 
      department: 'ALL',
      category: 'material',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      title: 'Canva Templates', 
      description: 'Official templates for posts and stories.', 
      link: 'https://canva.com', 
      department: 'PR',
      category: 'material',
      createdAt: '2024-01-10'
    },
    { 
      id: 3, 
      title: 'SLAM Logos', 
      description: 'Download high-resolution logo files.', 
      link: 'https://drive.google.com/logos', 
      department: 'ALL',
      category: 'material',
      createdAt: '2024-01-05'
    },
    { 
      id: 4, 
      title: 'Club Rules & Guidelines', 
      description: 'Official rules for all members and staff.', 
      link: 'https://docs.google.com/rules', 
      department: 'ALL',
      category: 'rule',
      createdAt: '2024-01-01'
    },
    { 
      id: 5, 
      title: 'AI Tools for PR Team', 
      description: 'Links to GPTS for content creation.', 
      link: 'https://chat.openai.com/gpts', 
      department: 'PR',
      category: 'tool',
      createdAt: '2024-01-12'
    },
    { 
      id: 6, 
      title: 'AI Tools for EP Team', 
      description: 'Links to GPTS for event planning.', 
      link: 'https://chat.openai.com/gpts', 
      department: 'EP',
      category: 'tool',
      createdAt: '2024-01-12'
    },
    { 
      id: 7, 
      title: 'Event Planning Checklist', 
      description: 'Comprehensive checklist for event organizers.', 
      link: 'https://docs.google.com/checklist', 
      department: 'EP',
      category: 'material',
      createdAt: '2024-01-08'
    },
    { 
      id: 8, 
      title: 'General Affairs Procedures', 
      description: 'Standard operating procedures for GA team.', 
      link: 'https://docs.google.com/procedures', 
      department: 'GA',
      category: 'rule',
      createdAt: '2024-01-03'
    }
  ];

  useEffect(() => {
    // 실제로는 백엔드 API 호출
    // axios.get('/api/admin/resources').then(res => setResources(res.data));
    setResources(mockResources);
  }, []);

  const filteredResources = resources.filter(resource => 
    selectedDepartment === 'ALL' || resource.department === selectedDepartment
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'material': return '📁';
      case 'rule': return '📋';
      case 'tool': return '🛠️';
      default: return '📄';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'ALL': return 'bg-gray-100 text-gray-800';
      case 'GA': return 'bg-blue-100 text-blue-800';
      case 'PR': return 'bg-purple-100 text-purple-800';
      case 'EP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    
    if (!newResource.title || !newResource.description || newResource.description.trim() === '') {
      alert('Please fill in title and description.');
      return;
    }

    try {
      // 실제로는 백엔드 API 호출
      // await axios.post('/api/admin/resources', newResource);
      
      const createdResource = {
        id: Date.now(),
        ...newResource,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setResources(prev => [createdResource, ...prev]);
      setNewResource({
        title: '',
        description: '',
        link: '',
        department: 'ALL',
        category: 'material'
      });
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to create resource: ' + error.message);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      // 실제로는 백엔드 API 호출
      // await axios.delete(`/api/admin/resources/${id}`);
      
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (error) {
      alert('Failed to delete resource: ' + error.message);
    }
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowDetailModal(true);
  };

  // Rich text editor functions
  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current && !composingRef.current) {
      setNewResource(prev => ({ ...prev, description: editorRef.current.innerHTML }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      exec('bold');
    }
  };

  const toggleBold = () => exec('bold');
  const toggleItalic = () => exec('italic');
  const toggleUnderline = () => exec('underline');
  const toggleList = () => exec('insertUnorderedList');
  const toggleOrderedList = () => exec('insertOrderedList');

  const handleColor = (color) => exec('foreColor', color);

  const handleClear = () => exec('removeFormat');

  // Sync external value into editor without breaking IME
  React.useEffect(() => {
    if (editorRef.current && typeof newResource.description === 'string' && !composingRef.current) {
      // Only update if different to avoid caret jumps
      if (editorRef.current.innerHTML !== newResource.description) {
        editorRef.current.innerHTML = newResource.description;
      }
    }
  }, [newResource.description]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">Materials & Rules</h1>
                 <button 
           onClick={() => setShowCreateModal(true)} 
           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
         >
           + Create New Resource
         </button>
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
        <select 
          id="department-filter"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="ALL">All Departments</option>
          <option value="GA">GA (General Affairs)</option>
          <option value="PR">PR (Public Relations)</option>
          <option value="EP">EP (Event Planning)</option>
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredResources.map(resource => (
                     <div 
             key={resource.id} 
             className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer"
             onClick={() => handleResourceClick(resource)}
           >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(resource.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(resource.department)}`}>
                  {resource.department}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteResource(resource.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                🗑️
              </button>
            </div>
            
                         <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{resource.title}</h2>
                         <div className="text-gray-600 mb-4 text-sm line-clamp-2">
               <div 
                 className="prose prose-sm max-w-none" 
                 dangerouslySetInnerHTML={{ __html: resource.description }} 
               />
             </div>
            
            <div className="flex justify-between items-center">
              {resource.link && (
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 Open Link
                </a>
              )}
              <span className="text-xs text-gray-500">{resource.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

             {/* Create Resource Modal */}
       {showCreateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
           <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create New Resource</h2>
            
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({...prev, title: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

    <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                 
                                   {/* Rich Text Toolbar */}
                  <div className="mb-2 flex flex-wrap items-center gap-1 sm:gap-2 border rounded-md p-2 bg-white">
                                       <button type="button" onClick={toggleBold} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100">B</button>
                    <button type="button" onClick={toggleItalic} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100 italic">I</button>
                    <button type="button" onClick={toggleUnderline} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100 underline">U</button>
                    <button type="button" onClick={toggleList} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100">• List</button>
                    <button type="button" onClick={toggleOrderedList} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100">1. List</button>
                   <div className="flex items-center gap-1">
                     {['#111827', '#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed'].map(color => (
                       <button
                         key={color}
                         type="button"
                         onClick={() => handleColor(color)}
                         className="w-6 h-6 rounded-full border hover:ring-2 hover:ring-offset-1"
                         style={{ backgroundColor: color, borderColor: '#e5e7eb' }}
                       />
        ))}
      </div>
                                       <button type="button" onClick={handleClear} className="px-2 py-1 text-xs sm:text-sm border rounded hover:bg-gray-100">Clear format</button>
                 </div>
                 
                 <div
                   ref={editorRef}
                   className="min-h-[160px] p-3 border rounded-md bg-white focus:outline-none text-left"
                   dir="ltr"
                   style={{ unicodeBidi: 'plaintext', whiteSpace: 'pre-wrap' }}
                   contentEditable
                   suppressContentEditableWarning
                   onInput={handleInput}
                   onKeyDown={handleKeyDown}
                   onCompositionStart={() => { composingRef.current = true; }}
                   onCompositionEnd={() => { composingRef.current = false; handleInput(); }}
                   onFocus={() => {
                     if (!editorRef.current) return;
                     const range = document.createRange();
                     range.selectNodeContents(editorRef.current);
                     range.collapse(false);
                     const sel = window.getSelection();
                     sel.removeAllRanges();
                     sel.addRange(range);
                   }}
                 />
               </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                 <input
                   type="url"
                   value={newResource.link}
                   onChange={(e) => setNewResource(prev => ({...prev, link: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="https://... (optional)"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newResource.department}
                  onChange={(e) => setNewResource(prev => ({...prev, department: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ALL">All Departments</option>
                  <option value="GA">GA (General Affairs)</option>
                  <option value="PR">PR (Public Relations)</option>
                  <option value="EP">EP (Event Planning)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({...prev, category: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="material">📁 Material</option>
                  <option value="rule">📋 Rule</option>
                  <option value="tool">🛠️ Tool</option>
                </select>
              </div>

                             <div className="flex gap-3 mt-6">
                 <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                   Create
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setShowCreateModal(false)} 
                   className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                 >
                   Cancel
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

             {/* Detail Modal */}
       {showDetailModal && selectedResource && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
           <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                         <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-2 sm:gap-3">
                 <span className="text-3xl sm:text-4xl">{getCategoryIcon(selectedResource.category)}</span>
                 <div>
                   <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedResource.title}</h2>
                   <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDepartmentColor(selectedResource.department)}`}>
                     {selectedResource.department}
                   </span>
                 </div>
               </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                                 <div className="bg-gray-50 p-4 rounded-lg">
                   <div 
                     className="prose max-w-none text-gray-700" 
                     dangerouslySetInnerHTML={{ __html: selectedResource.description }} 
                   />
                 </div>
              </div>
              
              {selectedResource.link && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Link</h3>
                  <a 
                    href={selectedResource.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    🔗 {selectedResource.link}
                  </a>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">Created: {selectedResource.createdAt}</span>
                <button
                  onClick={() => handleDeleteResource(selectedResource.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  🗑️ Delete Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
