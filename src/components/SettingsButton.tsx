interface SettingsButtonProps {
  onClick: () => void;
}

export default function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className="fixed top-4 right-4 p-3 bg-olive-600 hover:bg-olive-700 text-white border-none rounded-full w-12 h-12 cursor-pointer text-xl transition-colors flex items-center justify-center shadow-lg z-50" 
      title="Settings"
    >
      ⚙️
    </button>
  );
}
