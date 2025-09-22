/**
 * @file: /api/log.js
 * @description: 접속자 정보를 수신하여 로그로 기록하는 서버리스 함수입니다.
 * Vercel 환경에서 `api/` 폴더 안의 파일은 별도 설정 없이 서버리스 함수로 배포됩니다.
 */

const fs = require("fs");
const path = require("path");

// Vercel의 서버리스 함수는 (req, res) 형태의 단일 함수를 export 해야 합니다.
module.exports = (req, res) => {
  // POST 요청만 허용합니다.
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 요청 본문(body)에서 channel, details, device, userAgent 정보를 추출합니다.
  const { channel, details, device, userAgent } = req.body;

  // 필수 정보가 누락되었는지 확인합니다.
  if (!channel || !device) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // --- 로그 데이터 생성 ---
  // 현재 시간을 UTC 기준으로 기록합니다. (e.g., 2025-09-22T10:30:00.123Z)
  const timestamp = new Date().toISOString();
  // 세부 정보가 있는 경우, ', '로 합쳐서 문자열로 만듭니다.
  const detailsString = details && details.length > 0 ? details.join(', ') : '';
  // 저장할 로그 메시지 형식입니다.
  const logEntry = `[${timestamp}] Channel: ${channel}, Details: [${detailsString}], Device: ${device}, UserAgent: ${userAgent}\n`;

  // --- 로그 파일에 기록 ---
  // 실제 프로덕션 환경에서는 데이터베이스(DB)나 전문 로깅 서비스를 사용하는 것이 좋습니다.
  // 이 프로젝트는 빠른 구현을 위해 Vercel의 임시 파일 시스템(/tmp)에 로그를 기록합니다.
  const logFilePath = path.join("/tmp", "access_logs.txt");

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      // 파일 쓰기 에러가 발생해도 사용자 경험을 막지 않기 위해 성공 응답을 보냅니다.
      // 대신 서버 로그에 에러를 기록하여 추후 확인할 수 있도록 합니다.
      console.error("Error writing to log file:", err);
      return res.status(200).json({ message: "Logged (with write error)" });
    }

    // 성공적으로 로그가 기록되면 클라이언트에 성공 메시지를 응답합니다.
    res.status(200).json({ message: "Logged successfully" });
  });
};