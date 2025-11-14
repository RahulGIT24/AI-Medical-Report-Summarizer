import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
export function Typewriter({ text }:{text:string}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 10); // speed of typing

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="whitespace-pre-wrap">
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </div>
  );
}
