# Dicotalk

Discord 기반 고객 상담 위젯 라이브러리

웹사이트에 채팅 위젯을 추가하고, Discord 포럼 채널에서 상담을 관리하세요.

## 특징

- 🎫 **포럼 채널 기반** - 상담 건마다 포럼 포스트 생성, 태그로 상태 관리
- ⚡ **실시간 폴링** - WebSocket 없이 REST API + 폴링으로 실시간 대화
- 🎨 **커스터마이징** - 테마 색상, 로고, 메시지 등 자유롭게 설정
- 🚀 **Vercel 지원** - 서버리스 배포 지원, 무료 티어로 시작 가능

## 설치

```bash
pnpm add dicotalk
```

## 사용법

### 1. Discord 설정

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 봇 생성
2. 봇을 서버에 초대 (MESSAGE CONTENT Intent 활성화 필요)
3. 서버에 **포럼 채널** 생성
4. 포럼 채널에 태그 추가: `대기중`, `진행중`, `완료`

### 2. 봇 설정

```typescript
// lib/bot.ts
import { DicotalkBot } from 'dicotalk/bot';

export const bot = new DicotalkBot({
  token: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.DISCORD_CHANNEL_ID!, // 포럼 채널 ID
  agentName: '상담사',
});

// 봇 시작 (서버 시작 시)
bot.start();
```

### 3. API 라우트 설정

#### Next.js App Router

```typescript
// app/api/chat/[...path]/route.ts
import { createNextAppRouterHandler } from 'dicotalk/server/vercel';
import { bot } from '@/lib/bot';

const handler = createNextAppRouterHandler(bot, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || '*',
  },
});

export { handler as GET, handler as POST, handler as OPTIONS };
```

#### Express

```typescript
import express from 'express';
import { DicotalkBot } from 'dicotalk/bot';
import { createExpressRouter } from 'dicotalk/server/express';

const app = express();
const bot = new DicotalkBot({
  token: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.DISCORD_CHANNEL_ID!,
});

await bot.start();

app.use('/api/chat', createExpressRouter({ bot, cors: true }));

app.listen(4000);
```

### 4. 위젯 추가

```tsx
'use client';

import { ChatWidget } from 'dicotalk/widget';
import 'dicotalk/widget/styles.css';

export default function App() {
  return (
    <ChatWidget
      apiEndpoint="/api/chat"
      title="고객 상담"
      subtitle="24시간 운영"
      welcomeMessage="안녕하세요! 무엇을 도와드릴까요?"
      agentName="상담사"
      themeColor="#4ADE80"
      pollingInterval={3000}
    />
  );
}
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /session | 새 세션 생성 → Discord 포럼 포스트 생성 |
| POST | /messages | 고객 메시지 → Discord 전송 |
| GET | /messages | 새 메시지 조회 (폴링) |

## ChatWidget Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | string | required | API 엔드포인트 URL |
| `title` | string | 'Dicotalk' | 위젯 제목 |
| `subtitle` | string | - | 부제목 |
| `welcomeMessage` | string | - | 환영 메시지 |
| `agentName` | string | '상담사' | 상담사 이름 |
| `agentAvatar` | string | - | 상담사 아바타 URL |
| `logo` | string | - | 로고 URL |
| `themeColor` | string | '#4ADE80' | 테마 색상 |
| `pollingInterval` | number | 3000 | 폴링 간격 (ms) |
| `position` | string | 'bottom-right' | 위젯 위치 |

## 환경 변수

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_forum_channel_id
```

## 데모 실행

```bash
# 루트에서
pnpm install
pnpm build

# 데모 실행
cd demo
pnpm dev
```

## 라이선스

MIT
