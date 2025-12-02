import { Loader } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className={`${sizeClasses[size]} text-blue-600 animate-spin mb-3`} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
