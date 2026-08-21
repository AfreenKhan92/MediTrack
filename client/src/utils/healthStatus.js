/**
 * healthStatus.js
 *
 * Reusable `calculateHealthStatus(member)` function and badge-styling helpers
 * for displaying dynamic health status in MediTrack Family Profiles.
 *
 * Evaluation criteria (client-side only, no network calls):
 *  1. BMI category (Underweight / Overweight / Obese → risk points)
 *  2. Allergies count (3+ allergies → mild concern)
 *  3. Clinical notes keyword scan (~60 conditions, two severity tiers)
 *
 * Status levels:
 *  NO DATA          → no evaluable health information provided
 *  HEALTHY          → no known issues, normal or absent BMI
 *  NEEDS ATTENTION  → mild/moderate concerns (score 1–2)
 *  HIGH RISK        → serious/multiple chronic conditions (score 3+)
 */

// ─── Keyword lists ─────────────────────────────────────────────────────────────

/**
 * Each match → +2 risk points. Serious / chronic conditions.
 */
const HIGH_RISK_KEYWORDS = [
  // Cardiovascular
  'hypertension', 'high blood pressure', 'heart disease', 'heart failure',
  'coronary artery disease', 'atrial fibrillation', 'arrhythmia',
  'stroke', 'peripheral artery disease',
  // Metabolic
  'diabetes', 'type 2 diabetes', 'type 1 diabetes', 'diabetic', 'insulin resistance',
  'hyperglycemia', 'hypoglycemia',
  // Cancer
  'cancer', 'carcinoma', 'tumor', 'tumour', 'malignant', 'lymphoma', 'leukemia',
  // Pulmonary
  'copd', 'emphysema', 'chronic bronchitis', 'pulmonary fibrosis',
  // Renal
  'kidney disease', 'chronic kidney', 'renal failure', 'dialysis',
  // Liver
  'cirrhosis', 'liver failure',
  // Neurological
  'epilepsy', 'parkinson', 'multiple sclerosis',
  // Autoimmune / Inflammatory
  'lupus', 'rheumatoid arthritis', 'crohn', 'ulcerative colitis',
  // Mental health (serious)
  'schizophrenia', 'bipolar disorder',
  // Musculoskeletal (serious)
  'osteoporosis', 'osteoarthritis',
];

/**
 * Each match → +1 risk point. Moderate / manageable conditions.
 */
const MODERATE_KEYWORDS = [
  // Thyroid
  'hypothyroidism', 'hyperthyroidism', 'thyroid',
  // Lipids
  'high cholesterol', 'hypercholesterolemia', 'dyslipidemia', 'cholesterol',
  // Nutritional deficiencies
  'vitamin d deficiency', 'vitamin d', 'vitamin b12', 'iron deficiency',
  'iron-deficiency anemia', 'anemia', 'anaemia', 'folate deficiency',
  'calcium deficiency', 'magnesium deficiency',
  // Respiratory (mild)
  'asthma', 'sleep apnea', 'sleep apnoea',
  // Digestive
  'ibs', 'irritable bowel', 'acid reflux', 'gerd', 'gastritis',
  // Musculoskeletal (mild)
  'arthritis', 'gout', 'fibromyalgia',
  // Skin
  'eczema', 'psoriasis',
  // Mental health (mild)
  'anxiety', 'depression',
  // Metabolic (pre-disease)
  'prediabetes', 'pre-diabetes', 'pcos', 'polycystic',
  // Other
  'migraine', 'kidney stones', 'glaucoma',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** True if the member has at least one piece of health information to evaluate. */
const hasHealthData = (member) => {
  const hasNotes = member.notes && member.notes.trim().length > 0;
  const hasBmi = member.bmi != null || (member.heightCm && member.weightKg);
  const hasAllergies = member.allergies && member.allergies.length > 0;
  return hasNotes || hasBmi || hasAllergies;
};

/** Count how many keywords from the list appear in text (case-insensitive). */
const countMatches = (text, keywords) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return keywords.reduce((n, kw) => n + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
};

// ─── Main exported function ────────────────────────────────────────────────────

/**
 * calculateHealthStatus(member)
 *
 * @param {object} member  A FamilyMember document (or mock object)
 * @returns {'HEALTHY'|'NEEDS ATTENTION'|'HIGH RISK'|'NO DATA'}
 *
 * Scoring:
 *  HIGH_RISK keyword  → +2 per match, capped at 4
 *  MODERATE keyword   → +1 per match, capped at 3
 *  Obese BMI          → +2
 *  Overweight BMI     → +1
 *  Underweight BMI    → +1
 *  3+ allergies       → +1
 *
 * Thresholds:
 *  score === 0   → HEALTHY
 *  score 1–2     → NEEDS ATTENTION
 *  score >= 3    → HIGH RISK
 */
export const calculateHealthStatus = (member) => {
  if (!member) return 'NO DATA';
  if (!hasHealthData(member)) return 'NO DATA';

  let score = 0;
  const notes = member.notes || '';

  // 1. High-risk conditions in clinical notes
  const highRiskHits = countMatches(notes, HIGH_RISK_KEYWORDS);
  score += Math.min(highRiskHits * 2, 4);

  // 2. Moderate conditions in clinical notes
  const moderateHits = countMatches(notes, MODERATE_KEYWORDS);
  score += Math.min(moderateHits, 3);

  // 3. BMI category
  const { bmiCategory } = member;
  if (bmiCategory === 'Obese') score += 2;
  else if (bmiCategory === 'Overweight') score += 1;
  else if (bmiCategory === 'Underweight') score += 1;

  // 4. Allergy burden
  const allergyCount = Array.isArray(member.allergies) ? member.allergies.length : 0;
  if (allergyCount >= 3) score += 1;

  // Derive status
  if (score === 0) return 'HEALTHY';
  if (score <= 2) return 'NEEDS ATTENTION';
  return 'HIGH RISK';
};

// ─── Badge helpers ─────────────────────────────────────────────────────────────

/**
 * Badge variant for the given status key.
 * Maps to the existing Badge component `variant` prop.
 */
export const healthStatusVariant = (status) => {
  switch (status) {
    case 'HEALTHY':          return 'success';
    case 'NEEDS ATTENTION':  return 'warning';
    case 'HIGH RISK':        return 'danger';
    case 'NO DATA':
    default:                 return 'secondary';
  }
};

/**
 * Human-readable display label for a given status key.
 */
export const healthStatusLabel = (status) => {
  switch (status) {
    case 'HEALTHY':          return 'Healthy';
    case 'NEEDS ATTENTION':  return 'Needs Attention';
    case 'HIGH RISK':        return 'High Risk';
    case 'NO DATA':
    default:                 return 'No Data';
  }
};
