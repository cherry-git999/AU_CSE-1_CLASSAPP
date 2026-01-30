import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full bg-gradient-to-r from-transparent via-purple-900/10 to-transparent border-t border-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-gray-400 font-medium">
          Developed by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold">
            A SRI SAI CHARAN
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
