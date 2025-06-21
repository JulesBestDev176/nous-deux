import { useEffect, useState } from 'react';

const DebugUser = ({ currentUser, isAuthenticated }) => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      isAuthenticated,
      currentUser,
      token: localStorage.getItem('token') ? 'Présent' : 'Absent',
      userLocal: localStorage.getItem('user') ? 'Présent' : 'Absent',
      userParsed: (() => {
        try {
          const userStr = localStorage.getItem('user');
          return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
          return 'Erreur parsing';
        }
      })()
    };
    setDebugInfo(info);
  }, [currentUser, isAuthenticated]);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed top-0 left-0 bg-black text-white p-2 text-xs z-50 max-w-xs">
      <div>Auth: {isAuthenticated ? 'Oui' : 'Non'}</div>
      <div>User: {currentUser ? currentUser.name : 'Null'}</div>
      <div>Token: {debugInfo.token}</div>
      <div>User Local: {debugInfo.userLocal}</div>
      <div>User Parsed: {debugInfo.userParsed ? debugInfo.userParsed.name : 'Null'}</div>
    </div>
  );
};

export default DebugUser; 