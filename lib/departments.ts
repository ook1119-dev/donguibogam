// 진료과 목록 (아이콘: Microsoft Fluent Emoji 3D, MIT 라이선스)
export const departments = [
  { id: "internal", name: "내과", icon: "/icons/internal.png" },
  { id: "pediatrics", name: "소아과", icon: "/icons/pediatrics.png" },
  { id: "ent", name: "이비인후과", icon: "/icons/ent.png" },
  { id: "dermatology", name: "피부과", icon: "/icons/dermatology.png" },
  { id: "ophthalmology", name: "안과", icon: "/icons/ophthalmology.png" },
  { id: "orthopedics", name: "정형외과", icon: "/icons/orthopedics.png" },
  { id: "dental", name: "치과", icon: "/icons/dental.png" },
  { id: "obgyn", name: "산부인과", icon: "/icons/obgyn.png" },
  { id: "family", name: "가정의학과", icon: "/icons/family.png" },
] as const;

export type Department = (typeof departments)[number];
export type DepartmentId = Department["id"];

export function findDepartment(id: string | null | undefined) {
  return departments.find((d) => d.id === id);
}
