import { Gavel } from 'lucide-react';
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8 mt-12 text-center">
    <div className="flex justify-center items-center gap-2 mb-4">
       <Gavel className="text-blue-500" />
       <span className="text-white font-bold text-xl">AuctionPro</span>
    </div>
    <p>© 2025 AuctionPro. All rights reserved.</p>
  </footer>
);

export default Footer