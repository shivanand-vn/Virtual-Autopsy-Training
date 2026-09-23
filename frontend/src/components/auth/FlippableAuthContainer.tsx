import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RegistrationForm } from './RegistrationForm';
import { LoginForm } from './LoginForm';

export const FlippableAuthContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginRoute = location.pathname === '/login';
  const [isFlipped, setIsFlipped] = useState<boolean>(isLoginRoute);

  useEffect(() => {
    setIsFlipped(location.pathname === '/login');
  }, [location.pathname]);

  const handleFlipToLogin = () => {
    setIsFlipped(true);
    setTimeout(() => {
      navigate('/login');
    }, 350);
  };

  const handleFlipToRegister = () => {
    setIsFlipped(false);
    setTimeout(() => {
      navigate('/register');
    }, 350);
  };

  return (
    <div className="perspective-1000 w-full h-full">
      <div
        className={`w-full h-full transition-transform duration-700 ease-in-out transform-style-3d relative ${
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        }`}
      >
        {/* Front Face: Registration Form */}
        <div
          className={`w-full h-full backface-hidden ${
            isFlipped ? 'pointer-events-none absolute top-0 left-0 w-full invisible' : 'relative z-10 visible'
          }`}
          style={{
            transform: 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <RegistrationForm onFlipToLogin={handleFlipToLogin} />
        </div>

        {/* Back Face: Login Form */}
        <div
          className={`w-full h-full backface-hidden ${
            !isFlipped ? 'pointer-events-none absolute top-0 left-0 w-full invisible' : 'relative z-10 visible'
          }`}
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <LoginForm onFlipToRegister={handleFlipToRegister} />
        </div>
      </div>
    </div>
  );
};
