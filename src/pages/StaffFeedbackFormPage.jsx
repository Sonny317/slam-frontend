// src/pages/StaffFeedbackFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

const StarRating = ({ rating, setRating, size = 'text-2xl' }) => (
  <div className="flex justify-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className={`${size} transition-transform transform hover:scale-110 ${
          star <= rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function StaffFeedbackFormPage() {
  const location = useLocation();
  const params = useParams();
  
  const [formType, setFormType] = useState(''); // 'self' or 'peer'
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Self Evaluation State
  const [selfData, setSelfData] = useState({
    staffName: '',
    team: '',
    role: '',
    proactiveness: 0,
    taskCompletion: 0,
    communication: 0,
    timeManagement: 0,
    proudOf: '',
    teamChallenge: '',
    improvements: '',
    nextAction: ''
  });

  // Peer Evaluation State
  const [peerData, setPeerData] = useState({
    evaluatorName: '',
    evaluatorTeam: '',
    evaluatedStaff: '',
    contribution: 0,
    teamwork: 0,
    communication: 0,
    strengths: '',
    improvements: '',
    mvp: '',
    mvpReason: ''
  });

  const [staffList, setStaffList] = useState([]);

  // URL 파라미터 파싱
  const queryParams = new URLSearchParams(location.search);
  const eventId = params.eventId || queryParams.get('eventId');
  const branch = queryParams.get('branch');

  useEffect(() => {
    if (eventId && branch) {
      loadEventAndStaffData();
    }
  }, [eventId, branch]);

  const loadEventAndStaffData = async () => {
    try {
      // 이벤트 정보 로드
      const eventResponse = await axios.get(`/api/admin/events`);
      const event = eventResponse.data.find(e => String(e.id) === String(eventId));
      
      if (event) {
        setEventDetails(event);
      }

      // 스태프 목록 로드 (같은 지부의 스태프만)
      const staffResponse = await axios.get(`/api/staff/list?branch=${branch}`);
      setStaffList(staffResponse.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const handleSelfSubmit = async (e) => {
    e.preventDefault();
    
    if (!selfData.staffName || !selfData.team) {
      alert('Please fill in your name and team.');
      return;
    }

    if (selfData.proactiveness === 0 || selfData.taskCompletion === 0) {
      alert('Please rate all performance areas.');
      return;
    }

    try {
      await axios.post('/api/feedback/staff/self/submit', {
        eventId: Number(eventId),
        ...selfData
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('Failed to submit feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePeerSubmit = async (e) => {
    e.preventDefault();
    
    if (!peerData.evaluatorName || !peerData.evaluatedStaff) {
      alert('Please fill in evaluator and evaluated staff names.');
      return;
    }

    if (peerData.contribution === 0) {
      alert('Please provide ratings.');
      return;
    }

    try {
      await axios.post('/api/feedback/staff/peer/submit', {
        eventId: Number(eventId),
        ...peerData
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('Failed to submit feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>;
  }

     if (!formType) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-blue-100">
           <div className="text-6xl mb-4">🌟</div>
           <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Staff Feedback</h1>
           <p className="text-gray-600 mb-8">Choose evaluation type:</p>
           <div className="space-y-4">
             <button 
               onClick={() => setFormType('self')} 
               className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
             >
               <div className="text-2xl mb-2">🔍</div>
               <div className="font-semibold">Self Evaluation</div>
             </button>
             <button 
               onClick={() => setFormType('peer')} 
               className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
             >
               <div className="text-2xl mb-2">👥</div>
               <div className="font-semibold">Peer Evaluation</div>
             </button>
           </div>
         </div>
       </div>
     );
   }

     if (isSubmitted) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center text-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-100">
           <div className="text-6xl mb-4">🎉</div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">Thank You!</h1>
           <p className="text-lg text-gray-700 mb-6">
             Your {formType} evaluation has been submitted successfully.
           </p>
           <Link 
             to="/" 
             className="block w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
           >
             🏠 Back to Home
           </Link>
         </div>
       </div>
     );
   }

     return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-blue-100">
         <div className="text-center mb-8">
           <div className="text-4xl mb-4">
             {formType === 'self' ? '🔍' : '👥'}
           </div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
             {formType === 'self' ? 'Self Evaluation' : 'Peer Evaluation'}
           </h1>
           <p className="text-gray-600 mt-2">for <span className="font-semibold text-indigo-600">{eventDetails?.title}</span></p>
         </div>

        {formType === 'self' ? (
          <form onSubmit={handleSelfSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={selfData.staffName}
                  onChange={(e) => setSelfData(prev => ({...prev, staffName: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <select
                  value={selfData.team}
                  onChange={(e) => setSelfData(prev => ({...prev, team: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Team</option>
                  <option value="EP">EP (Event Planning)</option>
                  <option value="PR">PR (Public Relations)</option>
                  <option value="GA">GA (General Affairs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Role/Tasks Today</label>
              <input
                type="text"
                value={selfData.role}
                onChange={(e) => setSelfData(prev => ({...prev, role: e.target.value}))}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., Event hosting, Social media, Registration desk"
              />
            </div>

                         {/* Enhanced Performance Rating */}
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
               <h3 className="font-semibold mb-6 text-center text-lg text-blue-800 flex items-center justify-center">
                 <span className="mr-2">⭐</span>
                 Rate Your Performance (1-5 stars)
                 <span className="ml-2">⭐</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                   <div className="text-2xl mb-2">🚀</div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Proactiveness & Participation</label>
                   <StarRating 
                     rating={selfData.proactiveness} 
                     setRating={(rating) => setSelfData(prev => ({...prev, proactiveness: rating}))}
                     size="text-xl"
                   />
                 </div>
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                   <div className="text-2xl mb-2">✅</div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Task Completion</label>
                   <StarRating 
                     rating={selfData.taskCompletion} 
                     setRating={(rating) => setSelfData(prev => ({...prev, taskCompletion: rating}))}
                     size="text-xl"
                   />
                 </div>
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                   <div className="text-2xl mb-2">💬</div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Communication & Teamwork</label>
                   <StarRating 
                     rating={selfData.communication} 
                     setRating={(rating) => setSelfData(prev => ({...prev, communication: rating}))}
                     size="text-xl"
                   />
                 </div>
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                   <div className="text-2xl mb-2">⏰</div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Time Management</label>
                   <StarRating 
                     rating={selfData.timeManagement} 
                     setRating={(rating) => setSelfData(prev => ({...prev, timeManagement: rating}))}
                     size="text-xl"
                   />
                 </div>
               </div>
             </div>

                         {/* Enhanced Text Fields */}
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   What are you most proud of today? (1-2 things)
                 </label>
                 <textarea
                   rows="3"
                   value={selfData.proudOf}
                   onChange={(e) => setSelfData(prev => ({...prev, proudOf: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., I helped a struggling team member, I completed my tasks ahead of schedule"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   What was the biggest challenge our team faced today, and how did I contribute to (or impact) that situation?
                 </label>
                 <textarea
                   rows="3"
                   value={selfData.teamChallenge}
                   onChange={(e) => setSelfData(prev => ({...prev, teamChallenge: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., We had technical issues during registration, I helped troubleshoot and kept participants engaged"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   What would you improve next time?
                 </label>
                 <textarea
                   rows="2"
                   value={selfData.improvements}
                   onChange={(e) => setSelfData(prev => ({...prev, improvements: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., Better time planning, more active communication"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   One specific action to improve for next event?
                 </label>
                 <input
                   type="text"
                   value={selfData.nextAction}
                   onChange={(e) => setSelfData(prev => ({...prev, nextAction: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., Lead a team discussion, learn new social media tool"
                 />
               </div>
             </div>

                         <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
               Submit Self Evaluation
             </button>
          </form>
        ) : (
          <form onSubmit={handlePeerSubmit} className="space-y-6">
            {/* Peer Evaluation Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={peerData.evaluatorName}
                  onChange={(e) => setPeerData(prev => ({...prev, evaluatorName: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Team *</label>
                <select
                  value={peerData.evaluatorTeam}
                  onChange={(e) => setPeerData(prev => ({...prev, evaluatorTeam: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Your Team</option>
                  <option value="EP">EP (Event Planning)</option>
                  <option value="PR">PR (Public Relations)</option>
                  <option value="GA">GA (General Affairs)</option>
                </select>
              </div>
            </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member to Evaluate *</label>
               <select
                 value={peerData.evaluatedStaff}
                 onChange={(e) => setPeerData(prev => ({...prev, evaluatedStaff: e.target.value}))}
                 className="w-full p-2 border rounded-md"
                 required
               >
                 <option value="">Select Staff Member</option>
                 {staffList
                   .filter(staff => staff.team === peerData.evaluatorTeam && staff.role !== 'Leader' && staff.role !== 'President') // 같은 팀, Leader/President 제외
                   .map(staff => (
                     <option key={staff.id} value={staff.name}>
                       {staff.name} ({staff.role})
                     </option>
                   ))}
               </select>
             </div>

                         {/* Enhanced Peer Rating */}
             <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
               <h3 className="font-semibold mb-6 text-center text-lg text-green-800 flex items-center justify-center">
                 <span className="mr-2">⭐</span>
                 Rate Their Performance (1-5 stars)
                 <span className="ml-2">⭐</span>
               </h3>
               <div className="space-y-6">
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-green-50">
                   <div className="text-2xl mb-2">🎯</div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contribution & Responsibility
                   </label>
                   <p className="text-xs text-gray-600 mb-3">
                     Did they complete their assigned tasks on time with high quality?
                   </p>
                   <StarRating 
                     rating={peerData.contribution} 
                     setRating={(rating) => setPeerData(prev => ({...prev, contribution: rating}))}
                     size="text-xl"
                   />
                 </div>
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-green-50">
                   <div className="text-2xl mb-2">🤝</div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Teamwork
                   </label>
                   <p className="text-xs text-gray-600 mb-3">
                     Did they actively collaborate for team goals and create a positive atmosphere?
                   </p>
                   <StarRating 
                     rating={peerData.teamwork} 
                     setRating={(rating) => setPeerData(prev => ({...prev, teamwork: rating}))}
                     size="text-xl"
                   />
                 </div>
                 <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-green-50">
                   <div className="text-2xl mb-2">💬</div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Communication
                   </label>
                   <p className="text-xs text-gray-600 mb-3">
                     Did they clearly share their opinions and listen well to other team members?
                   </p>
                   <StarRating 
                     rating={peerData.communication} 
                     setRating={(rating) => setPeerData(prev => ({...prev, communication: rating}))}
                     size="text-xl"
                   />
                 </div>
               </div>
             </div>

                         {/* Enhanced Feedback */}
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   What did they do well?
                 </label>
                 <textarea
                   rows="2"
                   value={peerData.strengths}
                   onChange={(e) => setPeerData(prev => ({...prev, strengths: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., Great leadership, very helpful to team members"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Any suggestions for improvement? (Optional)
                 </label>
                 <textarea
                   rows="2"
                   value={peerData.improvements}
                   onChange={(e) => setPeerData(prev => ({...prev, improvements: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., Could be more proactive in team discussions"
                 />
               </div>

               {/* MVP Selection */}
               <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                 <label className="block text-sm font-medium text-yellow-800 mb-2">
                   🏆 Who was the MVP (Most Valuable Player) of this activity?
                 </label>
                 <select
                   value={peerData.mvp}
                   onChange={(e) => setPeerData(prev => ({...prev, mvp: e.target.value}))}
                   className="w-full p-2 border rounded-md mb-2"
                 >
                   <option value="">Select MVP</option>
                   {staffList
                     .filter(staff => staff.role !== 'Leader' && staff.role !== 'President')
                     .map(staff => (
                       <option key={staff.id} value={staff.name}>
                         {staff.name} ({staff.team})
                       </option>
                     ))}
                 </select>
                 
                 <label className="block text-sm font-medium text-yellow-800 mb-1">
                   Why did you choose them as MVP?
                 </label>
                 <textarea
                   rows="2"
                   value={peerData.mvpReason}
                   onChange={(e) => setPeerData(prev => ({...prev, mvpReason: e.target.value}))}
                   className="w-full p-2 border rounded-md"
                   placeholder="e.g., They showed exceptional leadership and helped everyone..."
                 />
               </div>
             </div>

                         <button type="submit" className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
               Submit Peer Evaluation
             </button>
          </form>
        )}

                 <div className="mt-6 text-center">
           <button
             onClick={() => setFormType('')}
             className="text-sm text-gray-500 hover:text-blue-600 underline transition-colors duration-200"
           >
             ← Change evaluation type
           </button>
         </div>
      </div>
    </div>
  );
}
