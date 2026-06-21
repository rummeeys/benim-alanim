export function buildStudentRecordKey(displayName, schoolNumber) {
  return `${displayName.trim()}_${String(schoolNumber).trim()}`;
}

export function getStoredLevel() {
  if (typeof window === "undefined") return 1;
  return parseInt(localStorage.getItem("studentLevel") ?? "1", 10) || 1;
}

export function applyStudentProgressToStorage({
  id,
  name,
  schoolNumber,
  level = 1,
}) {
  localStorage.setItem("studentName", name);
  localStorage.setItem("schoolNumber", String(schoolNumber));
  if (id != null) {
    localStorage.setItem("studentId", String(id));
  }
  localStorage.setItem("studentLevel", String(level));

  if (level >= 2) {
    localStorage.setItem("level2Unlocked", "true");
  } else {
    localStorage.removeItem("level2Unlocked");
  }

  if (level >= 3) {
    localStorage.setItem("seviye3Acik", "true");
  } else {
    localStorage.removeItem("seviye3Acik");
  }
}

export function advanceLevelInStorage(newLevel) {
  const current = getStoredLevel();
  if (newLevel <= current) return;

  localStorage.setItem("studentLevel", String(newLevel));
  if (newLevel >= 2) localStorage.setItem("level2Unlocked", "true");
  if (newLevel >= 3) localStorage.setItem("seviye3Acik", "true");
}

export function readStoredStudentName() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("studentName");
}

export function readStoredStudentId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("studentId");
}
