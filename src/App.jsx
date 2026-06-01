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
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              App Prompter
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            자연어로 설명하면 React 웹앱을 만듭니다
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 좌측: 입력 영역 */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Code className="w-6 h-6 text-amber-500" />
                앱 설명
              </h2>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예시: 할일 관리 앱을 만들어줘. 추가, 삭제, 완료 표시 기능이 있어야 하고, 다크모드도 지원하면 좋아."
                className="w-full h-48 sm:h-56 bg-white border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-base"
              />

              <button
                onClick={generateApp}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-lg transition flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    앱 생성하기
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base">{error}</p>
                </div>
              )}

              {/* 생성 이력 */}
              {generationHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 생성 이력</h3>
                  <div className="space-y-2">
                    {generationHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setGeneratedCode(item.code);
                          setPrompt(item.prompt);
                        }}
                        className="w-full text-left text-xs sm:text-sm bg-white hover:bg-gray-100 p-3 rounded border border-gray-200 text-gray-700 truncate transition"
                      >
                        <div className="truncate font-medium">{item.prompt}</div>
                        <div className="text-gray-500 text-xs">{item.timestamp}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 코드 출력 영역 */}
          <div className="space-y-4">
            {generatedCode ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 h-auto lg:h-[600px] flex flex-col">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">
                  📝 생성된 코드
                </h3>
                <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs sm:text-sm text-gray-300 overflow-auto flex-1 mb-4">
                  <code>{generatedCode}</code>
                </pre>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyCode}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Copy className="w-5 h-5" />
                    복사
                  </button>
                  <button
                    onClick={downloadCode}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    ⬇️ 다운로드
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center h-auto lg:h-[600px] flex items-center justify-center">
                <div className="text-gray-500">
                  <Zap className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-base sm:text-lg font-medium">
                    좌측에서 앱을 설명하고
                  </p>
                  <p className="text-base sm:text-lg">
                    "앱 생성하기"를 눌러보세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
