import React from 'react'
import { Clock } from 'lucide-react';
import { formatTimeRelative } from '../../utils/formatters';
const CountDown = ({ seconds }) => {
  const isUrgent = seconds < 300;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
      isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
    }`}>
      <Clock size={12} />
      {isUrgent ? 'Sắp kết thúc: ' : 'Còn lại: '}
      {formatTimeRelative(seconds)}
    </div>
  );
};
export default CountDown