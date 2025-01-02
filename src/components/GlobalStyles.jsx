import { useEffect } from 'react';

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fafafa;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      p {
        margin-bottom: 1rem;
      }

      button, input {
        font-family: inherit;
      }

      ::selection {
        background-color: #4CAF50;
        color: white;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return null;
};

export default GlobalStyles;
