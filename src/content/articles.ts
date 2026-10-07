export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  minutes: number;
  sections: ArticleSection[];
}

export const articles: Article[] = [
  {
    id: 'cycle-basics',
    title: 'How your cycle actually works',
    category: 'Cycle basics',
    summary: 'The four phases, what hormones do, and what "normal" can look like.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'A menstrual cycle runs from the first day of one period to the first day of the next. The average is around 28 days, but anything from about 21 to 35 days is common for adults. Teenagers and people approaching menopause often have wider variation.',
        ],
      },
      {
        heading: 'The four phases',
        paragraphs: [
          'Menstrual: the lining of the uterus sheds. Bleeding usually lasts 3 to 7 days.',
          'Follicular: estrogen rises and an egg matures. Energy and mood often improve.',
          'Ovulation: an egg is released, usually around the middle of the cycle. This is the most fertile window.',
          'Luteal: progesterone rises to support a possible pregnancy. If there is none, hormone levels fall and the next period begins.',
        ],
      },
      {
        heading: 'What counts as regular',
        paragraphs: [
          'Cycles that vary by up to 7 to 9 days between each other are usually still considered regular. Tracking for a few months shows your own pattern better than any single number.',
        ],
      },
    ],
  },
  {
    id: 'pms',
    title: 'PMS and why it hits before your period',
    category: 'Symptoms',
    summary: 'Why the last week of your cycle can feel heavy, and what tends to help.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'Premenstrual syndrome (PMS) is a mix of physical and emotional symptoms in the days before a period. It is linked to falling levels of estrogen and progesterone after ovulation.',
        ],
      },
      {
        heading: 'Common symptoms',
        paragraphs: [
          'Cramps, bloating, headaches, breast tenderness, tiredness, irritability, low mood, food cravings and trouble sleeping are all common. Symptoms usually fade once bleeding starts.',
        ],
      },
      {
        heading: 'What can help',
        paragraphs: [
          'Regular sleep, steady meals, gentle movement, less alcohol and caffeine in the luteal phase can reduce symptoms. Heat on the lower belly often eases cramps.',
          'If symptoms are severe enough to disrupt work or relationships, speak to a clinician. A more intense form called PMDD is treatable.',
        ],
      },
    ],
  },
  {
    id: 'fertility',
    title: 'Ovulation and your fertile window',
    category: 'Fertility',
    summary: 'When you are most likely to conceive and the signs your body gives you.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'Ovulation is when an egg is released from an ovary. The egg lives for about 12 to 24 hours. Sperm can survive for up to five days, so the fertile window is roughly five days before ovulation plus the day after.',
        ],
      },
      {
        heading: 'Signs of ovulation',
        paragraphs: [
          'Clear, stretchy, egg-white-like discharge is a common sign. Some people notice a mild one-sided twinge, a slightly higher sex drive, or a small rise in basal body temperature after ovulation.',
        ],
      },
      {
        heading: 'Timing',
        paragraphs: [
          'For a 28-day cycle, ovulation often falls around day 14. In longer or irregular cycles it moves later, because the part that changes is usually before ovulation, not after.',
          'If you are trying to conceive and nothing happens after 12 months (or 6 months over age 35), it is worth talking to a clinician.',
        ],
      },
    ],
  },
  {
    id: 'period-pain',
    title: 'Period cramps: normal or worth checking?',
    category: 'Symptoms',
    summary: 'Most cramps are manageable, but some patterns need a doctor\'s attention.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'Cramps happen because the uterus contracts to shed its lining. They usually start just before or with bleeding and ease after a day or two.',
        ],
      },
      {
        heading: 'What helps',
        paragraphs: [
          'Heat, gentle exercise, staying hydrated and anti-inflammatory painkillers can all ease cramps. Starting pain relief early often works better than waiting.',
        ],
      },
      {
        heading: 'When to see someone',
        paragraphs: [
          'Pain that stops you living normally, gets worse over time, lasts outside your period, or comes with very heavy bleeding is not something you just have to put up with. Conditions like endometriosis and fibroids are common and treatable.',
        ],
      },
    ],
  },
  {
    id: 'irregular',
    title: 'When your cycles are irregular',
    category: 'Cycle basics',
    summary: 'Common reasons cycles shift, and how tracking helps you spot them.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'A cycle that changes length from month to month is not automatically a problem. Stress, travel, big changes in weight, intense exercise, illness and poor sleep can all delay ovulation and shift your period.',
        ],
      },
      {
        heading: 'Worth investigating',
        paragraphs: [
          'Consistently very long cycles (over 35 days), very short ones (under 21 days), cycles that stop for months, or bleeding between periods are worth discussing with a clinician. Conditions such as PCOS and thyroid problems can affect cycles.',
        ],
      },
    ],
  },
  {
    id: 'discharge',
    title: 'Reading your cervical discharge',
    category: 'Fertility',
    summary: 'What the changes in discharge mean through the month.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'Discharge changes with your hormones. After a period it is often dry, then becomes sticky or creamy as estrogen rises, and turns clear and stretchy around ovulation.',
        ],
      },
      {
        heading: 'When to check',
        paragraphs: [
          'Discharge that is grey, green, frothy, has a strong or unusual smell, or comes with itching or pain may be an infection. That is worth a clinician visit and is usually easy to treat.',
        ],
      },
    ],
  },
  {
    id: 'contraception-basics',
    title: 'Contraception: the short version',
    category: 'Contraception',
    summary: 'How the main methods differ in effort and effectiveness.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'Contraception is very personal. Effectiveness, side effects, and how much remembering it takes all vary between methods.',
        ],
      },
      {
        heading: 'Common options',
        paragraphs: [
          'Hormonal methods such as the pill, patch and ring are used on a schedule. Long-acting options like the implant and IUD need little day-to-day effort. Barrier methods like condoms also reduce the risk of sexually transmitted infections.',
          'Nothing is 100% effective except abstinence. If you miss doses or a method fails, emergency contraception can help if used early.',
        ],
      },
    ],
  },
  {
    id: 'when-to-see-doctor',
    title: 'Signs it is time to see a clinician',
    category: 'Health',
    summary: 'A quick checklist of symptoms that deserve a professional opinion.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'Floppop is a tracker, not a doctor. But tracking can help you notice when something changes and describe it clearly.',
        ],
      },
      {
        heading: 'Have a chat with a professional if you notice',
        paragraphs: [
          'Bleeding between periods or after sex. Very heavy bleeding that soaks through protection quickly. Pain that disrupts your life. Cycles that stop for several months. Severe mood changes before your period. A one-off missed period can happen for many harmless reasons, but repeated changes are worth checking.',
        ],
      },
    ],
  },
];

const articleIndex = new Map(articles.map((article) => [article.id, article]));

export function getArticle(id: string): Article | undefined {
  return articleIndex.get(id);
}

export const articleCategories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))];
