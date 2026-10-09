import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const prompt = value.trim();
    if (!prompt || disabled) return;
    onSend(prompt);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex gap-2 mt-3">
      <input
        className="input flex-1"
        placeholder="Ask anything…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="btn-primary px-4 py-2.5"
        aria-label="Send"
      >
        ➤
      </button>
    </form>
  );
}
