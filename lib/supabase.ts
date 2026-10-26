import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// 서버에서만 쓰는 Supabase 연결이에요. secret 키는 브라우저로 절대 보내지 않아요.
// (위의 "server-only" 덕분에 실수로 화면 코드에서 불러오면 빌드가 막혀요.)
export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      ".env.local 파일에 SUPABASE_URL과 SUPABASE_SECRET_KEY를 넣고 개발 서버를 다시 켜주세요.",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
