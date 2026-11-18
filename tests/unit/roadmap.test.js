import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoadmap,
  countMilestones,
  findNextLesson,
  refreshRoadmapAvailability
} from '../../src/domain/roadmap.js';

describe('roadmap', () => {
  it('requires skill and genres', () => {
    assert.throws(() => generateRoadmap({ skillLevel: null, genres: ['rock-alt'] }), /Skill/);
    assert.throws(() => generateRoadmap({ skillLevel: 'beginner', genres: [] }), /genre/i);
  });

  it('produces at least 5 milestones', () => {
    const roadmap = generateRoadmap({
      skillLevel: 'beginner',
      genres: ['acoustic-folk', 'rock-alt']
    });
    assert.ok(countMilestones(roadmap) >= 5);
    assert.equal(roadmap.phases[0].lessons[0].status, 'available');
    assert.ok(findNextLesson(roadmap));
  });

  it('unlocks next lesson after completion', () => {
    const roadmap = generateRoadmap({ skillLevel: 'intermediate', genres: ['jazz-blues'] });
    const first = findNextLesson(roadmap);
    first.lesson.status = 'completed';
    refreshRoadmapAvailability(roadmap);
    const next = findNextLesson(roadmap);
    assert.ok(next);
    assert.notEqual(next.lesson.id, first.lesson.id);
  });
});
