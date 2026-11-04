import { useEffect, useState } from 'react';

const SaveStatus = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const onError = (event) => setError(event.detail);
    const onOk = () => setError('');
    window.addEventListener('remote-save-error', onError);
    window.addEventListener('remote-save-ok', onOk);
    return () => {
      window.removeEventListener('remote-save-error', onError);
      window.removeEventListener('remote-save-ok', onOk);
    };
  }, []);

  if (!error) return null;
  return (
    <div className="bg-red-600 text-white text-sm px-4 py-2 flex items-center justify-between">
      <span>Changes could not be saved to the database: {error}</span>
      <button onClick={() => setError('')} className="underline">Dismiss</button>
    </div>
  );
};

export default SaveStatus;
