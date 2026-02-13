
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Merhaba zihin kaşifi! Ben senin düşünce arkadaşınım. Bugün dünyayı hangi pencereden sorgulamak istersin?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStarted) scrollToBottom();
  }, [messages, isStarted]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Düşünen Yapay Zeka',
        text: 'Çocuğunuzun düşünme yetisini geliştiren P4C rehberiyle tanışın.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-10).map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const responseText = await getGeminiResponse(input, history);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: responseText || "Şu an düşüncelerim çok derinlerde, lütfen birazdan tekrar sorar mısın?",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  if (!isStarted) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] flex flex-col items-center justify-between p-6 relative overflow-hidden">
        {/* Cinematic Aurora Background */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora"></div>
        <div className="absolute bottom-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full animate-aurora"></div>

        <div className="w-full max-w-xl z-10 flex flex-col items-center text-center pt-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-white/10 mb-10 animate-fade-in shadow-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"></span>
            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em]">Dünyanın İlk P4C Yapay Zekası</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gradient leading-[0.85]">
            ZİHNİN<br />GELECEĞİ
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light leading-relaxed max-w-md mx-auto">
            Cevapları ezberleten değil, <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-8">sorgulamayı öğreten</span> benzersiz bir felsefe yol arkadaşı.
          </p>

          <div className="w-full space-y-4 px-4">
            <button 
              onClick={() => setIsStarted(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-7 rounded-[2.5rem] text-2xl font-black transition-all shadow-[0_25px_50px_rgba(79,70,229,0.4)] flex items-center justify-center gap-4 active:scale-95 border border-white/10"
            >
              KEŞFE BAŞLA ⚡
            </button>
            <button 
              onClick={handleShare}
              className="w-full glass py-6 rounded-[2.5rem] text-xl font-bold text-white transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-3"
            >
              PAYLAŞ 🔗
            </button>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="w-full max-w-xl z-10 grid grid-cols-2 gap-4 pb-12 mt-12">
          <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-32">
            <span className="text-2xl">🧩</span>
            <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Metodoloji</p>
              <p className="text-white text-sm font-bold">Sokratik Sorgulama</p>
            </div>
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-32">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Güvenlik</p>
              <p className="text-white text-sm font-bold">Safe AI Certified</p>
            </div>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-10 py-5 rounded-full font-black shadow-2xl z-50 animate-bounce">
            Bağlantı Kopyalandı! 🚀
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto bg-[#020617] relative shadow-2xl shadow-indigo-500/5">
      <header className="glass p-6 flex items-center justify-between z-20 border-b border-white/5 sticky top-0 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <Avatar />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Düşünen Dostum</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
              <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">P4C Uzmanı Aktif</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsStarted(false)}
          className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 custom-scrollbar pb-36">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-8 py-5 rounded-[2.5rem] flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.3em]">Düşünüyorum...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-12 backdrop-blur-sm">
        <form onSubmit={handleSend} className="max-w-xl mx-auto relative flex gap-3 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Aklındaki o derin soruyu buraya bırak..."
            className="flex-1 p-6 glass rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-500/20 text-white placeholder:text-slate-700 transition-all text-lg border-white/5"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-6 rounded-[2rem] hover:bg-indigo-500 disabled:opacity-20 transition-all active:scale-90 shadow-[0_15px_30px_rgba(79,70,229,0.3)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[9px] text-slate-700 mt-5 uppercase tracking-[0.5em] font-black">Elite Cognitive Experience</p>
      </div>
    </div>
  );
};

export default App;
