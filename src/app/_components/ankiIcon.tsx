import React from "react";

function AnkiIcon(props: React.HTMLAttributes<SVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M28 1c3.751 2.197 6.934 4.934 10 8 3.532-.321 6.634-.878 10-2 4.299-.483 7.804-.73 11.563 1.563C61.64 12.084 61.59 13.933 61 18a90.763 90.763 0 0 1-4.102 7.668c-1.16 2.274-1.16 2.274-.21 4.39L58 32l1.29 1.93c.44.642.88 1.284 1.335 1.945C62.841 39.419 63.85 41.751 63 46c-1.563 2.813-1.563 2.813-4 5-3.347.937-5.955 1.25-9.36.438-2.836-.635-4.764-.962-7.64-.438-2.845 2.594-4.963 5.323-7.188 8.46C33 62 33 62 31 63c-6.185.573-6.185.573-9.313-1.625-3.345-4.71-4.01-9.73-4.687-15.375l-2.738-.953-3.575-1.297-3.55-1.266C3.934 40.97 2.683 40.061 1 37c-.625-3.375-.625-3.375 0-7 2.984-3.706 6.525-5.815 10.875-7.563 3.4-2.097 3.4-2.097 3.68-5.398.128-2.28.19-4.564.18-6.848C16.03 6.628 16.874 4.841 19 2 22.215.393 24.43.597 28 1Zm-4 6c-2.209 3.538-2.077 6.27-2 10.375-.342 5.988-.342 5.988-3.145 8.703C16.29 27.566 13.7 28.78 11 30c-2.288 1.421-2.288 1.421-4 3v2l3.21 1.031c10.93 3.756 10.93 3.756 13.161 6.903.455 2.064.576 3.956.629 6.066a72.735 72.735 0 0 0 1.125 4L26 56h3a186.766 186.766 0 0 0 4.125-5.5c2.305-2.888 4.328-5.121 8.004-6.021 4.993-.453 9.902-.05 14.871.521l1-2a125.792 125.792 0 0 0-2.961-4.29c-5.186-7.23-5.186-7.23-4.754-11.581C50.355 24.61 51.59 22.342 53 20c.687-1.993 1.365-3.99 2-6-3.35-1.144-5.114-.85-8.375.438C42.921 15.896 39.989 16.491 36 16c-2.957-1.969-2.957-1.969-5.813-4.5C27.431 8.6 27.431 8.6 24 7Z" />
    </svg>
  );
}

export default AnkiIcon;
