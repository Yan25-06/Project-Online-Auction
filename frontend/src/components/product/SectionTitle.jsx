import React from 'react'
import { ChevronRight } from 'lucide-react'
const SectionTitle = ({icon: Icon, title, subtitle }) => {
  return (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Icon size={20} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        </div>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
        Xem tất cả <ChevronRight size={16} />
        </button>
    </div>
  )
}

export default SectionTitle