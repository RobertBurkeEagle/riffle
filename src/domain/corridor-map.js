import { GENRE_LABELS, findNextLesson } from './roadmap.js';

/** Cozy route inks — one per course/phase line */
export const ROUTE_PALETTE = [
  '#355E57', // sea-glass
  '#8B5E3C', // walnut clay
  '#4A6840', // moss
  '#A65D4E', // ember clay
  '#6A5B7A', // dusk plum
  '#4F6F8B' // soft slate
];

/**
 * @param {string[]} genres
 * @returns {{ id: string, label: string, color: string }[]}
 */
export function genreRoutes(genres = []) {
  return genres.map((id, i) => ({
    id,
    label: GENRE_LABELS[id] || id,
    color: ROUTE_PALETTE[i % ROUTE_PALETTE.length]
  }));
}

/**
 * Build an interactive corridor map model from the learner's roadmap.
 * Each phase is a route (course segment); each lesson is a station.
 *
 * @param {{ roadmap?: object | null, genres?: string[] }} input
 * @returns {{
 *   viewBox: string,
 *   routes: object[],
 *   stations: object[],
 *   legend: object[],
 *   next: { phaseId: string, lessonId: string } | null,
 *   empty: boolean
 * }}
 */
export function buildCorridorMap({ roadmap = null, genres = [] } = {}) {
  const nextFound = roadmap ? findNextLesson(roadmap) : null;
  const next = nextFound
    ? { phaseId: nextFound.phase.id, lessonId: nextFound.lesson.id }
    : null;

  if (!roadmap?.phases?.length) {
    const legend = genreRoutes(genres);
    const stations = [
      {
        id: 'build-course',
        kind: 'action',
        x: 500,
        y: 320,
        label: genres.length ? 'Build your course' : 'Set skill & genres',
        sub: genres.length
          ? 'Generate a roadmap from your preferences'
          : 'Open Preferences to start',
        status: 'available',
        color: ROUTE_PALETTE[0],
        phaseId: null,
        lessonId: null,
        action: genres.length ? 'generate' : 'preferences'
      }
    ];
    const routes = legend.map((g, i) => {
      const y = 180 + i * 70;
      return {
        id: g.id,
        label: g.label,
        color: g.color,
        d: `M 120 ${y} H 880`,
        dashed: true,
        status: 'preview'
      };
    });
    return {
      viewBox: '0 0 1000 640',
      routes,
      stations,
      legend,
      next: null,
      empty: true
    };
  }

  const phases = roadmap.phases;
  const legend = phases.map((phase, i) => ({
    id: phase.id,
    label: shortPhaseLabel(phase.title),
    color: ROUTE_PALETTE[i % ROUTE_PALETTE.length],
    status: phase.status
  }));

  const routes = [];
  const stations = [];
  const left = 100;
  const right = 900;
  const top = 120;
  const rowGap = Math.min(100, 460 / Math.max(phases.length, 1));

  phases.forEach((phase, pi) => {
    const color = ROUTE_PALETTE[pi % ROUTE_PALETTE.length];
    const baseY = top + pi * rowGap;
    const lessons = phase.lessons || [];
    const count = Math.max(lessons.length, 1);
    const inset = (pi % 2) * 36;
    const span = right - left - inset;
    const step = count === 1 ? 0 : span / (count - 1);

    const points = lessons.map((lesson, li) => {
      const x = count === 1 ? (left + right) / 2 : left + inset / 2 + li * step;
      const y = baseY + (li % 2 === 0 ? -10 : 14);
      const isNext = next && next.phaseId === phase.id && next.lessonId === lesson.id;
      stations.push({
        id: `${phase.id}:${lesson.id}`,
        kind: 'lesson',
        x,
        y,
        label: lesson.title,
        sub: `${lesson.duration} · ${statusLabel(lesson.status)}`,
        status: lesson.status,
        isNext: !!isNext,
        color,
        phaseId: phase.id,
        lessonId: lesson.id,
        action: lesson.status === 'locked' ? 'locked' : 'open'
      });
      return { x, y };
    });

    let d;
    if (points.length === 1) {
      d = `M ${left} ${baseY} H ${right}`;
    } else {
      d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const cur = points[i];
        const midX = (prev.x + cur.x) / 2;
        d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
      }
    }

    routes.push({
      id: phase.id,
      label: shortPhaseLabel(phase.title),
      color,
      d,
      dashed: phase.status === 'locked',
      status: phase.status
    });
  });

  return {
    viewBox: '0 0 1000 640',
    routes,
    stations,
    legend,
    next,
    empty: false,
    courseTitle: roadmap.title
  };
}

function shortPhaseLabel(title = '') {
  return title.replace(/^Phase\s*\d+:\s*/i, '').trim() || title;
}

function statusLabel(status) {
  if (status === 'completed') return 'Complete';
  if (status === 'available') return 'Open';
  if (status === 'in-progress') return 'In progress';
  return 'Locked';
}
