import { motion } from 'framer-motion';

interface HeaderProps {
  currentView: 'upload' | 'report' | 'all-reports';
  onNavigate: (view: 'upload' | 'report' | 'all-reports') => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const navItems = [
    { id: 'upload' as const, label: 'Upload' },
    { id: 'report' as const, label: 'Report' },
    { id: 'all-reports' as const, label: 'See All Reports' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* The div below now contains an <img> tag for your logo */}
            <div >
              <img 
                src="src\logo.png" // Path to your logo in the public folder 
                className="w-18 h-14 object-contain" // Ensures the logo fits perfectly
              />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bullet Healthcare Services</h1>
              <p className="text-xs text-gray-600">Document Management</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-1.5">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
