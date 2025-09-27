import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  title,
  message,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#181818] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] focus:outline-none resize-none"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to confirm, Escape to cancel
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!inputValue.trim()}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
              inputValue.trim() 
                ? 'bg-[#F7BF24] hover:bg-[#F7BF24]/90 text-black' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;
