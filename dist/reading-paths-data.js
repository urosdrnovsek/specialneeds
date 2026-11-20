'use strict';
// Reading paths: the twenty short (2–3 activity) reading courses are grouped into four staged
// paths. Each original course becomes one stage. The original courses stay defined and routable
// (bookmarks, saved progress and per-course tests keep working) but are hidden from course lists
// via `mergedInto`. Path activities remember their source (`from`) so earlier progress still shows.
const readingPaths = [
  {
    id: 'reading-path-letters',
    title: 'First letters and sounds',
    goal: 'Hear word endings, recognise taught letters and link each one to its sound.',
    need: 'Letters are not yet recognised reliably, or letters and their sounds are not yet linked.',
    home: 'Find one taught letter on a real label or page. Say its sound and think of a word that starts with it.',
    sources: ['rhyme', 'letter-forms', 'letter-links', 'letter-lookalikes', 'letter-shape-sounds']
  },
  {
    id: 'reading-path-blend',
    title: 'Blend and build short words',
    goal: 'Move through each sound in a short word, blend sounds smoothly and build words from letters.',
    need: 'Letter sounds are known, but joining them into words or keeping every sound is still hard.',
    home: 'Build one short word with real letters or magnets, then change one letter to make a new word.',
    sources: [
      'sound-steps',
      'smooth-blending',
      'word-builders',
      'keep-every-sound',
      'word-builders-puzzles',
      'word-paths-syllables'
    ]
  },
  {
    id: 'reading-path-meaning',
    title: 'Practise reading short words',
    goal: 'Read taught short words in new combinations and check that the word makes sense.',
    need: 'Short words can be blended, and now need practice in new words and meaningful checking.',
    home: 'Read a taught word on a label, then find or point to the real object it names.',
    sources: [
      'new-word-tools',
      'familiar-words',
      'short-words-meanings',
      'word-meanings-checking',
      'read-and-repair'
    ]
  },
  {
    id: 'reading-path-purpose',
    title: 'Reading in play and plans',
    goal: 'Use taught words and short captions to direct play, follow small plans and make choices.',
    need: 'Short words can be read with support and the child is ready to use reading to make things happen.',
    home: 'Write a two-word plan together (for example "get cup"), read it, and carry it out.',
    sources: [
      'meaningful-reading',
      'reading-small-plans',
      'playful-reading-studio',
      'word-picture-challenges'
    ]
  }
];
(() => {
  const sounds = learningSkills.find(s => s.id === 'sounds');
  const find = id => learningSkills.flatMap(s => s.courses).find(c => c.id === id);
  const map = new Map();
  for (const path of readingPaths) {
    const sources = path.sources.map(id => {
      const c = find(id);
      if (!c) throw Error('Reading path source missing: ' + id);
      return c;
    });
    path.reading = true;
    path.path = true;
    path.level = 'Adult-supported early reading path';
    path.props = sources[1]?.props || sources[0].props;
    path.notice = [...new Set(sources.flatMap(c => c.notice || []))].slice(0, 4);
    path.stages = sources.map(c => ({ title: c.title, goal: c.goal, size: c.activities.length, from: c.id }));
    path.activities = sources.flatMap(c =>
      c.activities.map((a, i) => ({ ...a, from: [c.id, i], purpose: a.purpose || c.goal }))
    );
    sources.forEach((c, stage) => {
      c.mergedInto = path.id;
      c.activities.forEach((_, i) => {
        const offset = sources.slice(0, stage).reduce((n, s) => n + s.activities.length, 0);
        map.set(c.id + ':' + i, [path.id, offset + i]);
      });
      map.set(c.id, [path.id, null]);
    });
  }
  // Paths are listed first in "Letters, sounds & early reading"; merged courses stay for old links.
  sounds.courses.unshift(...readingPaths);
  const toPath = id => (map.get(id) ? map.get(id)[0] : id);
  for (const section of parentSupportSections) {
    section.courses = [...new Set((section.courses || []).map(toPath))];
    section.readingCourses = [...new Set((section.readingCourses || []).map(toPath))];
    section.activities = (section.activities || []).map(([id, i]) => map.get(id + ':' + i) || [id, i]);
  }
  window.readingPathFor = (courseId, index) => map.get(courseId + ':' + index) || null;
})();
