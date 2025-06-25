import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/685c582e71a033190a6217df/1iukc8rea';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <BrowserRouter>
      <div>App Content</div>
    </BrowserRouter>
  );
}

export default App; 