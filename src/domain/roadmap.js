import { LESSON_CONTENT } from './exercises.js';

export const GENRE_LABELS = {
  'acoustic-folk': 'Acoustic / Folk',
  'rock-alt': 'Rock & Alternative',
  'jazz-blues': 'Jazz & Blues',
  metal: 'Metal',
  classical: 'Classical'
};

const TITLE_MAP = {
  'acoustic-folk': 'Indie Folk Foundation',
  'rock-alt': 'Rock Rhythm Builder',
  'jazz-blues': 'Jazz & Blues Pathway',
  metal: 'Metal Technique Track',
  classical: 'Classical Fundamentals'
};

/**
 * @param {{ skillLevel: string, genres: string[] }} input
 * @returns {{ title: string, skillLevel: string, genres: string[], generatedAt: string, phases: object[] }}
 */
export function generateRoadmap({ skillLevel, genres }) {
  if (!skillLevel) {
    throw Object.assign(new Error('Skill level required'), { code: 'VALIDATION' });
  }
  if (!genres?.length) {
    throw Object.assign(new Error('Pick at least one genre'), { code: 'VALIDATION' });
  }

  const primary = genres[0];
  const title = TITLE_MAP[primary] || 'Custom Learning Path';
  const fingerstyle = primary === 'acoustic-folk' || primary === 'classical';
  const skill = skillLevel;

  const phases = [
    {
      id: 'p1',
      title: skill === 'beginner' ? 'Phase 1: Open Chord Fluency' : 'Phase 1: Extending Your Chord Vocabulary',
      status: 'available',
      lessons: [
        {
          id: 'p1l1',
          title: skill === 'advanced' ? 'Color Tones & Add9 Shapes' : 'Core Shape Review',
          duration: '10 mins',
          type: 'chords',
          status: 'available',
          stepsDone: []
        },
        {
          id: 'p1l2',
          title: skill === 'advanced' ? 'ii–V–I Transitions' : 'Two-Chord Transitions',
          duration: '12 mins',
          type: 'chords',
          status: 'locked',
          stepsDone: []
        }
      ]
    },
    {
      id: 'p2',
      title: fingerstyle ? 'Phase 2: Fingerpicking Basics' : 'Phase 2: Strumming & Groove',
      status: 'locked',
      lessons: [
        {
          id: 'p2l1',
          title: fingerstyle ? 'Travis Picking Pattern A' : 'Downbeat Drive Pattern',
          duration: '15 mins',
          type: fingerstyle ? 'travis' : 'strum',
          status: 'locked',
          stepsDone: []
        },
        {
          id: 'p2l2',
          title: fingerstyle ? 'Travis Picking Pattern B' : 'Syncopated Upstrokes',
          duration: '15 mins',
          type: fingerstyle ? 'travis' : 'strum',
          status: 'locked',
          stepsDone: []
        }
      ]
    },
    {
      id: 'p3',
      title: primary === 'metal' ? 'Phase 3: Palm Mute Power' : 'Phase 3: Percussive Strumming',
      status: 'locked',
      lessons: [
        {
          id: 'p3l1',
          title: primary === 'metal' ? 'Muted Gallop Feel' : 'Muted Body Hits',
          duration: '12 mins',
          type: 'percussive',
          status: 'locked',
          stepsDone: []
        },
        {
          id: 'p3l2',
          title: 'Groove Over Two Chords',
          duration: '15 mins',
          type: 'percussive',
          status: 'locked',
          stepsDone: []
        }
      ]
    },
    {
      id: 'p4',
      title: 'Phase 4: Capo Transposition',
      status: 'locked',
      lessons: [
        {
          id: 'p4l1',
          title: 'Capo Placement & Tuning Check',
          duration: '8 mins',
          type: 'capo',
          status: 'locked',
          stepsDone: []
        },
        {
          id: 'p4l2',
          title: 'Shape-to-Key Translation',
          duration: '14 mins',
          type: 'capo',
          status: 'locked',
          stepsDone: []
        }
      ]
    },
    {
      id: 'p5',
      title: 'Phase 5: Song Application',
      status: 'locked',
      lessons: [
        {
          id: 'p5l1',
          title: 'Apply Patterns to a Progression',
          duration: '15 mins',
          type: 'chords',
          status: 'locked',
          stepsDone: []
        }
      ]
    }
  ];

  const roadmap = {
    title,
    skillLevel: skill,
    genres: [...genres],
    generatedAt: new Date().toISOString(),
    phases
  };
  refreshRoadmapAvailability(roadmap);
  return roadmap;
}

/**
 * Unlock lessons sequentially; mutate roadmap in place.
 * @param {object | null | undefined} roadmap
 */
export function refreshRoadmapAvailability(roadmap) {
  if (!roadmap?.phases) return;

  let priorComplete = true;
  roadmap.phases.forEach((phase) => {
    let phaseStarted = false;
    let allDone = true;
    phase.lessons.forEach((lesson, idx) => {
      if (lesson.status === 'completed') {
        phaseStarted = true;
        return;
      }
      allDone = false;
      if (priorComplete && idx === 0) {
        lesson.status = 'available';
        phaseStarted = true;
      } else if (idx > 0 && phase.lessons[idx - 1].status === 'completed') {
        lesson.status = 'available';
        phaseStarted = true;
      } else if (lesson.status !== 'available') {
        lesson.status = 'locked';
      }
    });

    if (allDone) phase.status = 'completed';
    else if (phaseStarted) phase.status = 'in-progress';
    else phase.status = priorComplete ? 'available' : 'locked';

    priorComplete = allDone;
  });
}

/**
 * @param {object} roadmap
 * @returns {{ phase: object, lesson: object } | null}
 */
export function findNextLesson(roadmap) {
  if (!roadmap?.phases) return null;
  for (const phase of roadmap.phases) {
    for (const lesson of phase.lessons) {
      if (lesson.status === 'available') return { phase, lesson };
    }
  }
  return null;
}

/**
 * @param {string} type
 * @returns {string[]}
 */
export function lessonStepsForType(type) {
  return (LESSON_CONTENT[type] || LESSON_CONTENT.chords).steps;
}

/**
 * Count milestones (lessons) for invariants.
 * @param {object} roadmap
 */
export function countMilestones(roadmap) {
  return (roadmap?.phases || []).reduce((n, p) => n + (p.lessons?.length || 0), 0);
}
