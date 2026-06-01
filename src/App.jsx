import React, { useState } from 'react';
import { Copy, Zap, Code, AlertCircle, Loader } from 'lucide-react';

export default function AppPrompter() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);

  const generateApp = async () => {
    if (!prompt.trim()) {
      setError('앱을 설명해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ⭐ API 키 (환경변수에서 읽음)
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: `당신은 React 전문 개발자입니다. 사용자의 자연어 설명을 받아 완전히 작동하는 React 컴포넌트를 만들어야 합니다.

**반드시 따를 규칙:**
1. 오직 하나의 React 함수 컴포넌트만 반환 (export default)
2. JSX만 사용
3. Tailwind CSS를 사용 (class names)
4. useState, useEffect 같은 기본 hooks만 사용
5. 외부 라이브러리 import 금지
6. 반드시 실행 가능한 코드

응답은 코드만 제공하세요.`,
          messages: [
            { role: "user", content: `다음 앱을 만들어주세요: ${prompt}` }
          ],
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '코드 생성 실패');
      }

      const code = data.content[0].text;
      setGeneratedCode(code);
      setGenerationHistory([
        { prompt, code, timestamp: new Date().toLocaleTimeString() },
        ...generationHistory.slice(0, 4)
      ]);

    } catch (err) {
      setError(`에러: ${err.message}`);
      console.error('상세 에러:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('코드가 복사되었습니다!');
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedCode));
    element.setAttribute('download', 'generated-app.jsx');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            App Prompter
          </h1>
        </div>
        <p className="text-slate-400 text-lg">자연어로 설명하면 React 웹앱을 만듭니다</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-400" />
              앱 설명
            </h2>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 할일 관리 앱, 추가/삭제 기능, 다크모드"
              className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />

            <button
              onClick={generateApp}
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  앱 생성하기
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3 flex gap-2 text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {generatedCode ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 생성된 코드</h3>
              <pre className="bg-slate-950 border border-slate-600 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto max-h-96">
                <code>{generatedCode}</code>
              </pre>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={copyCode}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  복사
                </button>
                <button
                  onClick={downloadCode}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg"
                >
                  ⬇️ 다운로드
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">앱을 설명하고 "앱 생성하기"를 눌러보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}