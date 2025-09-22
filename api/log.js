/**
 * @file: /api/log.js
 * @description: 접속자 정보를 수신하여 Vercel KV 데이터베이스에 기록하는 서버리스 함수입니다.
 */

import { createClient } from '@vercel/kv';

// Vercel KV 클라이언트를 생성합니다.
// 관련 환경 변수(KV_URL, KV_REST_API_URL 등)는 Vercel이 자동으로 주입해 줍니다.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Vercel의 서버리스 함수는 (req, res) 형태의 단일 함수를 export 해야 합니다.
export default async function handler(req, res) {
  // POST 요청만 허용합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 요청 본문(body)에서 channel, details, device, userAgent 정보를 추출합니다.
  const { channel, details, device, userAgent } = req.body;

  // 필수 정보가 누락되었는지 확인합니다.
  if (!channel || !device) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // --- 로그 데이터 생성 ---
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    channel,
    details: details || [], // details가 없는 경우 빈 배열로 저장
    device,
    userAgent,
  };

  try {
    // --- Vercel KV에 데이터 저장 ---
    // 'logs'라는 이름의 리스트(list)에 새로운 로그 데이터를 추가합니다.
    await kv.lpush('logs', logData);

    // 성공적으로 로그가 기록되면 클라이언트에 성공 메시지를 응답합니다.
    res.status(200).json({ message: 'Logged successfully' });
  } catch (error) {
    console.error('Error writing to Vercel KV:', error);
    // DB 쓰기 에러가 발생해도 사용자 경험을 막지 않기 위해 성공 응답을 보냅니다.
    return res.status(200).json({ message: 'Logged (with DB write error)' });
  }
}
