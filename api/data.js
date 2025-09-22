
/**
 * @file: /api/data.js
 * @description: Supabase 데이터베이스에서 모든 로그 데이터를 조회하여 반환하는 서버리스 함수입니다.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트를 생성합니다.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // GET 요청만 허용합니다.
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- Supabase에서 데이터 조회 ---
    // 'logs' 테이블에서 모든 데이터를 조회합니다.
    const { data, error } = await supabase.from('logs').select('*');

    if (error) {
      throw error;
    }

    // 성공적으로 데이터를 조회하면 클라이언트에 JSON 형태로 응답합니다.
    res.status(200).json(data);
  } catch (error) {
    console.error('Error reading from Supabase:', error);
    // 에러 발생 시 500 상태 코드와 에러 메시지를 응답합니다.
    return res.status(500).json({ message: 'Error reading from database' });
  }
}
