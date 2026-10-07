export type CatalogIcon = string;

export interface CatalogItem {
  id: string;
  label: string;
  icon: CatalogIcon;
}

export interface CatalogGroup {
  id: string;
  label: string;
  items: CatalogItem[];
}

export const symptomGroups: CatalogGroup[] = [
  {
    id: 'pain',
    label: 'Pain',
    items: [
      { id: 'cramps', label: 'Cramps', icon: 'flash' },
      { id: 'headache', label: 'Headache', icon: 'head-outline' },
      { id: 'migraine', label: 'Migraine', icon: 'head-alert-outline' },
      { id: 'backache', label: 'Backache', icon: 'human-handsup' },
      { id: 'joint_pain', label: 'Joint pain', icon: 'bone' },
      { id: 'muscle_aches', label: 'Muscle aches', icon: 'arm-flex-outline' },
      { id: 'breast_tenderness', label: 'Breast tenderness', icon: 'heart-pulse' },
      { id: 'sore_breasts', label: 'Swollen breasts', icon: 'water-outline' },
      { id: 'pelvic_pain', label: 'Pelvic pain', icon: 'target' },
      { id: 'leg_pain', label: 'Leg pain', icon: 'walk' },
    ],
  },
  {
    id: 'body',
    label: 'Body & energy',
    items: [
      { id: 'fatigue', label: 'Fatigue', icon: 'sleep' },
      { id: 'low_energy', label: 'Low energy', icon: 'battery-low' },
      { id: 'high_energy', label: 'High energy', icon: 'battery-high' },
      { id: 'dizziness', label: 'Dizziness', icon: 'rotate-3d-variant' },
      { id: 'hot_flashes', label: 'Hot flashes', icon: 'thermometer-high' },
      { id: 'chills', label: 'Chills', icon: 'snowflake' },
      { id: 'insomnia', label: 'Trouble sleeping', icon: 'weather-night' },
      { id: 'nausea', label: 'Nausea', icon: 'emoticon-sick-outline' },
      { id: 'vomiting', label: 'Vomiting', icon: 'emoticon-dead-outline' },
      { id: 'fever', label: 'Fever', icon: 'thermometer' },
    ],
  },
  {
    id: 'digestion',
    label: 'Digestion',
    items: [
      { id: 'bloating', label: 'Bloating', icon: 'circle-double' },
      { id: 'constipation', label: 'Constipation', icon: 'emoticon-confused-outline' },
      { id: 'diarrhea', label: 'Diarrhea', icon: 'toilet' },
      { id: 'indigestion', label: 'Indigestion', icon: 'stomach' },
      { id: 'cravings', label: 'Cravings', icon: 'food-drumstick-outline' },
      { id: 'increased_appetite', label: 'Increased appetite', icon: 'food-apple-outline' },
      { id: 'decreased_appetite', label: 'Decreased appetite', icon: 'food-off-outline' },
    ],
  },
  {
    id: 'skin',
    label: 'Skin & hair',
    items: [
      { id: 'acne', label: 'Acne', icon: 'face-man-shimmer-outline' },
      { id: 'dry_skin', label: 'Dry skin', icon: 'water-off-outline' },
      { id: 'oily_skin', label: 'Oily skin', icon: 'oil' },
      { id: 'hair_changes', label: 'Hair changes', icon: 'hair-dryer-outline' },
      { id: 'sensitive_skin', label: 'Sensitive skin', icon: 'hand-back-right-outline' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    items: [
      { id: 'sore_throat', label: 'Sore throat', icon: 'emoticon-neutral-outline' },
      { id: 'runny_nose', label: 'Runny nose', icon: 'emoticon-frown-outline' },
      { id: 'allergies', label: 'Allergies', icon: 'flower-pollen-outline' },
      { id: 'swelling', label: 'Water retention', icon: 'water-plus-outline' },
      { id: 'breast_lumps', label: 'Breast changes', icon: 'circle-outline' },
    ],
  },
];

export const moodGroups: CatalogGroup[] = [
  {
    id: 'mood',
    label: 'How you feel',
    items: [
      { id: 'happy', label: 'Happy', icon: 'emoticon-happy-outline' },
      { id: 'calm', label: 'Calm', icon: 'emoticon-cool-outline' },
      { id: 'excited', label: 'Excited', icon: 'emoticon-excited-outline' },
      { id: 'confident', label: 'Confident', icon: 'emoticon-tongue-outline' },
      { id: 'loved', label: 'Loved', icon: 'heart-outline' },
      { id: 'motivated', label: 'Motivated', icon: 'rocket-launch-outline' },
      { id: 'focused', label: 'Focused', icon: 'bullseye-arrow' },
      { id: 'energetic', label: 'Energetic', icon: 'lightning-bolt-outline' },
      { id: 'sad', label: 'Sad', icon: 'emoticon-sad-outline' },
      { id: 'anxious', label: 'Anxious', icon: 'emoticon-frown-outline' },
      { id: 'stressed', label: 'Stressed', icon: 'emoticon-confused-outline' },
      { id: 'irritable', label: 'Irritable', icon: 'emoticon-angry-outline' },
      { id: 'angry', label: 'Angry', icon: 'emoticon-devil-outline' },
      { id: 'mood_swings', label: 'Mood swings', icon: 'weather-windy' },
      { id: 'emotional', label: 'Emotional', icon: 'water-outline' },
      { id: 'overwhelmed', label: 'Overwhelmed', icon: 'head-question-outline' },
      { id: 'lonely', label: 'Lonely', icon: 'account-outline' },
      { id: 'low_motivation', label: 'Low motivation', icon: 'battery-low' },
      { id: 'distracted', label: 'Distracted', icon: 'brain' },
      { id: 'depressed', label: 'Down', icon: 'weather-cloudy' },
    ],
  },
];

export const activityItems: CatalogItem[] = [
  { id: 'exercise', label: 'Exercise', icon: 'run-fast' },
  { id: 'yoga', label: 'Yoga', icon: 'meditation' },
  { id: 'walking', label: 'Walking', icon: 'walk' },
  { id: 'swimming', label: 'Swimming', icon: 'swim' },
  { id: 'sex', label: 'Sex', icon: 'heart-multiple-outline' },
  { id: 'masturbation', label: 'Masturbation', icon: 'hand-heart-outline' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'alcohol', label: 'Alcohol', icon: 'glass-cocktail' },
  { id: 'caffeine', label: 'Caffeine', icon: 'coffee-outline' },
  { id: 'smoking', label: 'Smoking', icon: 'smoking' },
  { id: 'medication', label: 'Medication', icon: 'pill' },
  { id: 'sick', label: 'Feeling sick', icon: 'emoticon-sick-outline' },
];

export const flowLevels = [
  { id: 'spotting', label: 'Spotting', icon: 'water-minus-outline' },
  { id: 'light', label: 'Light', icon: 'water-outline' },
  { id: 'medium', label: 'Medium', icon: 'water' },
  { id: 'heavy', label: 'Heavy', icon: 'water-plus' },
] as const;

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export const dischargeOptions: CatalogItem[] = [
  { id: 'dry', label: 'Dry', icon: 'water-off-outline' },
  { id: 'sticky', label: 'Sticky', icon: 'dots-horizontal' },
  { id: 'creamy', label: 'Creamy', icon: 'water-outline' },
  { id: 'watery', label: 'Watery', icon: 'water' },
  { id: 'egg_white', label: 'Egg white', icon: 'egg-outline' },
  { id: 'unusual_color', label: 'Unusual color', icon: 'palette-outline' },
  { id: 'unusual_smell', label: 'Unusual smell', icon: 'flower-outline' },
];

export const sexOptions: CatalogItem[] = [
  { id: 'protected', label: 'Protected', icon: 'shield-check-outline' },
  { id: 'unprotected', label: 'Unprotected', icon: 'shield-off-outline' },
  { id: 'withdrawal', label: 'Withdrawal', icon: 'arrow-u-left-top' },
  { id: 'high_drive', label: 'High sex drive', icon: 'fire' },
  { id: 'low_drive', label: 'Low sex drive', icon: 'fire-off' },
];

export const cravingOptions: CatalogItem[] = [
  { id: 'sweet', label: 'Sweet', icon: 'candy-outline' },
  { id: 'salty', label: 'Salty', icon: 'shaker-outline' },
  { id: 'chocolate', label: 'Chocolate', icon: 'cookie-outline' },
  { id: 'carbs', label: 'Carbs', icon: 'bread-slice-outline' },
  { id: 'spicy', label: 'Spicy', icon: 'chili-hot-outline' },
];

const index = new Map<string, CatalogItem>();
for (const group of [...symptomGroups, ...moodGroups]) {
  for (const item of group.items) index.set(item.id, item);
}
for (const item of [
  ...activityItems,
  ...dischargeOptions,
  ...sexOptions,
  ...cravingOptions,
  ...flowLevels.map((f) => ({ id: f.id, label: f.label, icon: f.icon })),
]) {
  index.set(item.id, item);
}

export function catalogItem(id: string): CatalogItem | undefined {
  return index.get(id);
}

export function catalogLabel(id: string): string {
  return index.get(id)?.label ?? id;
}

export function catalogIcon(id: string): CatalogIcon {
  return index.get(id)?.icon ?? 'circle-small';
}
