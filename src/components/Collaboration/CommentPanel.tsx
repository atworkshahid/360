import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/shareService';
import { MessageSquare, Send } from 'lucide-react';

interface Comment {
  id: string;
  courseId: string;
  targetId: string;
  userId: string;
  userName: string;
  commentText: string;
  createdAt: any;
}

interface CommentPanelProps {
  courseId: string;
  targetId: string;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({ courseId, targetId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'courses', courseId, 'comments'),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [courseId, targetId]);

  const handleSend = async () => {
    if (!newComment.trim() || !auth.currentUser) return;
    await addDoc(collection(db, 'courses', courseId, 'comments'), {
      courseId,
      targetId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      commentText: newComment,
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  return (
    <div className="w-full p-4 border border-slate-200 rounded-md bg-white">
      <h3 className="font-bold flex items-center gap-2 mb-4"><MessageSquare size={16}/> Comments</h3>
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="text-sm border-b pb-2">
            <p className="font-bold text-xs text-indigo-600">{c.userName}</p>
            <p>{c.commentText}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)} 
          className="flex-grow p-2 border rounded text-sm"
          placeholder="Add a comment..."
        />
        <button onClick={handleSend} className="p-2 bg-indigo-600 text-white rounded"><Send size={16}/></button>
      </div>
    </div>
  );
};
