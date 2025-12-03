'use client';

import { ChatWidget } from 'dicotalk/widget';
import 'dicotalk/widget/styles.css';

export default function Home() {
  return (
    <main className="demo-container">
      {/* 헤더 */}
      <header className="demo-header">
        <h1>Dicotalk</h1>
        <p>Discord 기반 고객 상담 위젯</p>
      </header>

      {/* 소개 카드 */}
      <div className="demo-card">
        <h2>Discord로 고객 상담을 받아보세요</h2>
        <p>
          웹사이트에 채팅 위젯을 추가하고, Discord 포럼 채널에서 상담을
          관리하세요. 상담사는 Discord에서 답변하고, 고객은 웹에서 실시간으로
          확인할 수 있습니다.
        </p>

        <div className="setup-steps">
          <div className="setup-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h3>Discord 봇 설정</h3>
              <p>Discord 서버에 포럼 채널을 만들고, 봇을 초대하세요.</p>
            </div>
          </div>
          <div className="setup-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h3>API 서버 배포</h3>
              <p>Vercel 또는 Express 서버에 API 엔드포인트를 설정하세요.</p>
            </div>
          </div>
          <div className="setup-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h3>위젯 추가</h3>
              <p>웹사이트에 ChatWidget 컴포넌트를 추가하세요.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 코드 예시 */}
      <div className="demo-card">
        <h2>설치 및 사용법</h2>
        <pre className="code-block">
{`# 패키지 설치
pnpm add dicotalk

# 환경 변수 설정
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_forum_channel_id`}
        </pre>

        <h2 style={{ marginTop: 24 }}>React에서 사용</h2>
        <pre className="code-block">
{`import { ChatWidget } from 'dicotalk/widget';
import 'dicotalk/widget/styles.css';

function App() {
  return (
    <ChatWidget
      apiEndpoint="/api/chat"
      title="고객 상담"
      subtitle="24시간 운영"
      agentName="상담사"
      themeColor="#4ADE80"
    />
  );
}`}
        </pre>
      </div>

      {/* 기능 카드 */}
      <div className="demo-features">
        <div className="feature-card">
          <h3>🎫 포럼 채널 기반</h3>
          <p>상담 건마다 포럼 포스트 생성. 태그로 상태 관리.</p>
        </div>
        <div className="feature-card">
          <h3>⚡ 실시간 폴링</h3>
          <p>WebSocket 없이 REST API + 폴링으로 실시간 대화.</p>
        </div>
        <div className="feature-card">
          <h3>🎨 커스터마이징</h3>
          <p>테마 색상, 로고, 메시지 등 자유롭게 설정.</p>
        </div>
        <div className="feature-card">
          <h3>🚀 Vercel 지원</h3>
          <p>서버리스 배포 지원. 무료 티어로 시작 가능.</p>
        </div>
      </div>

      {/* 위젯 (데모용 - API 없이 UI만 테스트) */}
      <ChatWidget
        apiEndpoint="/api/chat"
        title="데브다이브"
        subtitle="24시간 운영해요"
        welcomeMessage="안녕하세요! 무엇을 도와드릴까요? 😊"
        agentName="젠"
        themeColor="#4ADE80"
        pollingInterval={3000}
        placeholder="메시지를 입력하세요..."
      />
    </main>
  );
}
