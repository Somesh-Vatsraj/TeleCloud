import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useToast } from '../hooks/useToast.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import ChatInput from '../components/chat/ChatInput.jsx';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api
      .listMessages()
      .then((d) => setMessages(d.messages || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setFetching(false));
  }, [toast]);

  const send = async (prompt) => {
    const optimistic = {
      id: `tmp-${Date.now()}`,
      direction: 'out',
      sender: 'You',
      text: prompt,
      created_at: Math.floor(Date.now() / 1000),
    };
    setMessages((m) => [...m, optimistic]);
    setLoading(true);
    try {
      const data = await api.aiChat(prompt);
      setMessages((m) => [
        ...m,
        {
          id: `ai-${Date.now()}`,
          direction: 'in',
          sender: 'TeleCloud AI',
          text: data.reply,
          created_at: Math.floor(Date.now() / 1000),
        },
      ]);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">AI Chat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Powered by Pollinations AI — free, no API key required.
        </p>
      </div>
      {!fetching && (
        <>
          <ChatBox messages={messages} loading={loading} />
          <ChatInput onSend={send} disabled={loading} />
        </>
      )}
    </div>
  );
}
