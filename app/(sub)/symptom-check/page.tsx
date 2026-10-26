import BackHeader from "@/components/BackHeader";
import SymptomChecker from "@/components/SymptomChecker";
import { getHospitals } from "@/lib/data";

// 증상으로 진료과 찾기
export default async function SymptomCheckPage() {
  const hospitals = await getHospitals();
  // 진료과별 병원 수 (추천 카드의 '병원 N곳' 버튼에 써요)
  const hospitalCounts: Record<string, number> = {};
  for (const h of hospitals) hospitalCounts[h.department] = (hospitalCounts[h.department] ?? 0) + 1;

  return (
    <>
      <BackHeader title="증상으로 찾기" fallbackHref="/" />
      <SymptomChecker hospitalCounts={hospitalCounts} />
    </>
  );
}
