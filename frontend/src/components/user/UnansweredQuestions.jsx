import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuestionService } from '../../services/backendService';

const UnansweredQuestions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState({});

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await QuestionService.getUnansweredBySeller(user.id);
      console.log('Unanswered questions:', res);
      setQuestions(res || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchQuestions();
  }, [user]);

  const handleAnswer = async (questionId) => {
    const answer = answerText[questionId];
    if (!answer || answer.trim() === '') {
      alert('Vui lòng nhập câu trả lời');
      return;
    }

    try {
      await QuestionService.answer(questionId, { sellerId: user.id, answerText: answer });
      alert('Đã trả lời câu hỏi!');
      setAnswerText({ ...answerText, [questionId]: '' });
      fetchQuestions(); // Refresh
    } catch (err) {
      console.error('Error answering question:', err);
      alert('Không thể trả lời câu hỏi');
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Câu hỏi chưa trả lời</h3>
      
      {questions.length === 0 ? (
        <p className="text-gray-500 italic">Không có câu hỏi nào chưa trả lời.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link to={`/products/${q.product?.id}`} className="font-bold text-blue-600 hover:underline">
                    {q.product?.name || 'Sản phẩm'}
                  </Link>
                  <p className="text-xs text-gray-400">{q.user?.full_name || 'Người dùng'} - {new Date(q.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded border mb-3">
                <p className="font-semibold text-sm text-gray-700 mb-1">Câu hỏi:</p>
                <p className="text-gray-800">{q.question_text}</p>
              </div>
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nhập câu trả lời của bạn..."
                  rows="3"
                  value={answerText[q.id] || ''}
                  onChange={(e) => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                ></textarea>
                <div className="text-right mt-2">
                  <button
                    onClick={() => handleAnswer(q.id)}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Gửi câu trả lời
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnansweredQuestions;
