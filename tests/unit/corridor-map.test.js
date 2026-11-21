import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorridorMap } from '../../src/domain/corridor-map.js';
import { generateRoadmap } from '../../src/domain/roadmap.js';

describe('corridor-map', () => {
  it('builds empty genre preview when no roadmap', () => {
    const map = buildCorridorMap({ genres: ['acoustic-folk', 'rock-alt'] });
    assert.equal(map.empty, true);
    assert.ok(map.routes.length >= 2);
    assert.equal(map.stations[0].action, 'generate');
  });

  it('maps phases to routes and lessons to stations', () => {
    const roadmap = generateRoadmap({
      skillLevel: 'intermediate',
      genres: ['acoustic-folk']
    });
    const map = buildCorridorMap({ roadmap, genres: roadmap.genres });
    assert.equal(map.empty, false);
    assert.equal(map.routes.length, roadmap.phases.length);
    const lessonCount = roadmap.phases.reduce((n, p) => n + p.lessons.length, 0);
    assert.equal(map.stations.length, lessonCount);
    assert.ok(map.stations.every((s) => typeof s.x === 'number' && typeof s.y === 'number'));
    assert.ok(map.next);
    const nextStation = map.stations.find(
      (s) => s.phaseId === map.next.phaseId && s.lessonId === map.next.lessonId
    );
    assert.ok(nextStation?.isNext);
  });
});
