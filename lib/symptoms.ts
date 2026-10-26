import type { DepartmentId } from "./departments";

// 증상 글 → 진료과 추천 (단어 찾기 방식이라 AI·서버 없이 화면에서 바로 계산해요)
// 짧은 단어는 엉뚱하게 걸리기 쉬워서 구체적인 표현으로 적었어요.
// '^'로 시작하는 단어는 앞에 다른 글자가 붙어 있으면 안 걸려요.
// 예) '^이가 아파'는 "이가 아파요"에는 걸리지만 "아이가 아파요"에는 안 걸림

type Rule = { dept: DepartmentId; reason: string; keywords: string[] };

const rules: Rule[] = [
  {
    dept: "ent",
    reason: "코·목·귀 증상은 이비인후과에서 봐요",
    keywords: ["콧물", "코막힘", "코가 막", "비염", "재채기", "목감기", "목이 아", "목이 따끔", "목 아파", "편도", "인후", "침 삼키", "귀가", "귀에서", "귀 통증", "중이염", "이명", "축농증", "가래", "목소리"],
  },
  {
    dept: "internal",
    reason: "감기·소화·만성질환은 내과에서 봐요",
    keywords: ["열이", "열나", "고열", "미열", "발열", "몸살", "감기", "독감", "기침", "오한", "복통", "배가 아", "배 아파", "속이 안", "설사", "구토", "토할", "메스꺼", "체한", "체했", "소화", "속쓰", "변비", "두통", "머리가 아", "머리 아파", "혈압", "당뇨", "어지러"],
  },
  {
    dept: "pediatrics",
    reason: "아이라면 소아과에서 먼저 진료받는 게 좋아요",
    keywords: ["아이", "아기", "애기", "유아", "어린이", "소아", "우리 애", "딸이", "아들이", "초등학생", "신생아"],
  },
  {
    dept: "dermatology",
    reason: "피부 증상은 피부과에서 봐요",
    keywords: ["피부", "여드름", "가려", "간지러", "두드러기", "발진", "아토피", "습진", "뾰루지", "트러블", "탈모", "무좀", "화상", "흉터", "각질"],
  },
  {
    dept: "ophthalmology",
    reason: "눈 증상은 안과에서 봐요",
    keywords: ["눈이", "눈에", "눈 ", "충혈", "시력", "결막염", "다래끼", "안구", "침침", "눈물", "눈곱", "시야", "렌즈"],
  },
  {
    dept: "orthopedics",
    reason: "뼈·관절·근육은 정형외과에서 봐요",
    keywords: ["허리", "무릎", "어깨", "손목", "발목", "관절", "뼈", "골절", "삐었", "삐끗", "염좌", "근육", "디스크", "목 통증", "목이 뻐근", "담 걸", "담이", "다쳤", "넘어졌", "인대"],
  },
  {
    dept: "dental",
    reason: "이·잇몸 증상은 치과에서 봐요",
    keywords: ["치아", "이빨", "잇몸", "충치", "사랑니", "치통", "^이가 시려", "^이가 흔들", "^이가 아파", "^이가 아프", "턱이", "입냄새", "스케일링"],
  },
  {
    dept: "obgyn",
    reason: "여성 건강은 산부인과에서 봐요",
    keywords: ["생리", "월경", "임신", "질염", "냉이", "배란", "피임", "자궁", "유방", "난소"],
  },
  {
    dept: "family",
    reason: "검진·예방접종이나 전반적인 상담은 가정의학과에서 봐요",
    keywords: ["건강검진", "검진", "예방접종", "주사", "피곤", "피로", "잠이", "불면", "체중", "금연", "만성"],
  },
];

// 이런 말이 있으면 진료과보다 119가 먼저예요.
const emergencyKeywords = ["가슴이 아", "가슴 통증", "가슴이 답답", "숨이 차", "숨쉬기", "숨을 못", "호흡곤란", "의식", "기절", "실신", "마비", "경련", "발작", "피를 토", "토혈", "피가 멈추지"];

export type Recommendation = { dept: DepartmentId; reason: string; matched: string[] };

function includesKeyword(text: string, keyword: string) {
  if (!keyword.startsWith("^")) return text.includes(keyword);
  const word = keyword.slice(1);
  for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
    if (i === 0 || /[\s,.!?]/.test(text[i - 1])) return true;
  }
  return false;
}

export function recommendDepartments(text: string): {
  emergency: boolean;
  results: Recommendation[];
} {
  const t = text.trim();
  if (t.length < 2) return { emergency: false, results: [] };

  const emergency = emergencyKeywords.some((k) => t.includes(k));
  const scored = rules
    .map((rule) => ({
      dept: rule.dept,
      reason: rule.reason,
      matched: rule.keywords
        .filter((k) => includesKeyword(t, k))
        .map((k) => k.replace("^", "").trim()),
    }))
    .filter((r) => r.matched.length > 0)
    // 아이 이야기면 소아과를 맨 위로, 나머지는 많이 맞은 순서
    .sort((a, b) => {
      const boost = (r: Recommendation) => (r.dept === "pediatrics" ? 100 : 0);
      return boost(b) + b.matched.length - (boost(a) + a.matched.length);
    })
    .slice(0, 3);

  if (scored.length > 0) return { emergency, results: scored };

  // 아무것도 안 맞으면: 어디로 갈지 모를 때 가는 곳
  return {
    emergency,
    results: [
      { dept: "family", reason: "어디로 가야 할지 모르겠다면 가정의학과에서 먼저 상담해 보세요", matched: [] },
      { dept: "internal", reason: "몸 전체가 안 좋다면 내과도 괜찮아요", matched: [] },
    ],
  };
}
