import { type ExamOption } from "../components/modals/ExamSelectionModal";

function toId(p: string) {
  return p.split('/questionData/')[1].replace(/\.json$/,'');
}

function getName(p: string) {
  // 取最後一段檔名當顯示用名稱，順便美化
  const file = p.split('/').pop()!.replace(/\.json$/,'');
  return decodeURIComponent(file)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, s => s.toUpperCase());
}

const exams = import.meta.glob('../../questionData/*.json');


export function GetExamList(): ExamOption[] {
  return Object.entries(exams).map(([url]) => ({
    id: toId(url),
    url,
    label: getName(url),
  }));
}