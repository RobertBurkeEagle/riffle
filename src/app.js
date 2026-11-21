import { createProfileStore } from './storage/profile-store.js';
import { SKILL_QUESTIONS, skillLevelFromScore } from './domain/skill-check.js';
import {
  GENRE_LABELS,
  generateRoadmap as buildRoadmap,
  refreshRoadmapAvailability,
  findNextLesson
} from './domain/roadmap.js';
import { buildCorridorMap } from './domain/corridor-map.js';
import {
  buildExerciseSession,
  defaultDifficultyForSkill,
  appendPracticeEvent
} from './domain/exercises.js';
import { clampTranspose } from './domain/transpose.js';
import {
  getLessonDrill,
  clampStepIndex,
  nextStepIndex,
  prevStepIndex,
  allStepsComplete,
  msPerBeat
} from './domain/lesson-player.js';
import {
  applyLearningPrompt,
  shouldAutoRefreshPrompt,
  buildLearningPrompt
} from './domain/learning-prompt.js';

const store = createProfileStore();

let authTab = 'signin';
let currentUser = null;
let skillCheckIndex = 0;
let skillCheckScore = 0;
let skillCheckChoice = null;
let activeLesson = null;
let lessonDrill = null;
let lessonStepIndex = 0;
let lessonTimerId = null;
let lessonTimerRunning = false;
let lessonBeat = 0;
let practiceMode = 'chord';
let practiceTranspose = 0;
let practiceSession = null;
let promptRefreshTimer = null;
let activeDialogId = null;
let dialogReturnFocus = null;
let corridorModel = null;
let selectedStationId = null;
let clockTimerId = null;

function persistCurrentUser() {
  if (!currentUser) return;
  currentUser = store.upsertProfile(currentUser);
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function getFocusable(container) {
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter((el) => {
    if (el.hasAttribute('hidden') || el.closest('[hidden]')) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
}

function openDialog(id, { initialFocus } = {}) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  dialogReturnFocus = document.activeElement;
  activeDialogId = id;
  dialog.classList.remove('hidden');
  dialog.removeAttribute('hidden');
  const focusables = getFocusable(dialog);
  const target =
    (initialFocus && dialog.querySelector(initialFocus)) ||
    focusables[0] ||
    dialog;
  requestAnimationFrame(() => target.focus?.());
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  dialog.classList.add('hidden');
  dialog.setAttribute('hidden', '');
  if (activeDialogId === id) activeDialogId = null;
  const restore = dialogReturnFocus;
  dialogReturnFocus = null;
  if (restore && typeof restore.focus === 'function') {
    requestAnimationFrame(() => restore.focus());
  }
}

function setAuthTab(tab) {
  authTab = tab;
  const signin = document.getElementById('auth-tab-signin');
  const signup = document.getElementById('auth-tab-signup');
  const nameField = document.getElementById('auth-name-field');
  const submit = document.getElementById('auth-submit');
  const password = document.getElementById('auth-password');
  document.getElementById('auth-error').classList.add('hidden');

  if (tab === 'signup') {
    signin.className = 'px-3 py-2 text-sm font-medium text-app-muted';
    signup.className =
      'px-3 py-2 text-sm font-medium text-app-accent border-b-2 border-app-accent -mb-px';
    signin.setAttribute('aria-selected', 'false');
    signup.setAttribute('aria-selected', 'true');
    nameField.classList.remove('hidden');
    submit.textContent = 'Create profile';
    if (password) password.setAttribute('autocomplete', 'new-password');
  } else {
    signup.className = 'px-3 py-2 text-sm font-medium text-app-muted';
    signin.className =
      'px-3 py-2 text-sm font-medium text-app-accent border-b-2 border-app-accent -mb-px';
    signin.setAttribute('aria-selected', 'true');
    signup.setAttribute('aria-selected', 'false');
    nameField.classList.add('hidden');
    submit.textContent = 'Sign in';
    if (password) password.setAttribute('autocomplete', 'current-password');
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;

  try {
    if (authTab === 'signup') {
      const displayName =
        document.getElementById('auth-name').value.trim() || email.split('@')[0];
      const profile = await store.signup({ displayName, email, password });
      enterApp(profile);
      return;
    }
    const match = await store.authenticate(email, password);
    enterApp(match);
  } catch (err) {
    showAuthError(err.message || 'Authentication failed.');
  }
}

function continueAsGuest() {
  const profile = store.createGuest();
  enterApp(profile);
}

function enterApp(profile) {
  currentUser = profile;
  store.setSession(profile.id);
  closeDialog('auth-gate');
  practiceTranspose = 0;
  const diff = document.getElementById('practice-difficulty');
  if (diff) diff.value = defaultDifficultyForSkill(profile.skillLevel);
  renderAll();
  refreshPracticeSession();
  if (!profile.skillCheckDone) openSkillCheck();
  lucide.createIcons();
}

function signOut() {
  stopLessonTimer();
  clearTimeout(promptRefreshTimer);
  store.setSession(null);
  currentUser = null;
  activeLesson = null;
  lessonDrill = null;
  practiceSession = null;
  closeDialog('skill-check-modal');
  document.getElementById('auth-form').reset();
  setAuthTab('signin');
  openDialog('auth-gate', { initialFocus: '#auth-email' });
  lucide.createIcons();
}

function openSkillCheck() {
  skillCheckIndex = 0;
  skillCheckScore = 0;
  skillCheckChoice = null;
  openDialog('skill-check-modal');
  renderSkillCheckStep();
}

function rerunSkillCheck() {
  openSkillCheck();
}

function renderSkillCheckStep() {
  const q = SKILL_QUESTIONS[skillCheckIndex];
  const container = document.getElementById('skill-check-steps');
  document.getElementById('skill-check-progress').textContent =
    `Question ${skillCheckIndex + 1} of ${SKILL_QUESTIONS.length}`;
  document.getElementById('skill-check-next').textContent =
    skillCheckIndex === SKILL_QUESTIONS.length - 1 ? 'Finish' : 'Next';

  container.innerHTML = `
    <p class="font-medium mb-3">${q.prompt}</p>
    <div class="space-y-2">
      ${q.options
        .map(
          (opt) => `
        <label class="flex items-center gap-3 border border-app-border rounded-md p-3 cursor-pointer hover:border-app-accent transition-colors">
          <input type="radio" name="skill-q" value="${opt.score}" onchange="skillCheckChoice = Number(this.value)">
          <span class="text-sm">${opt.label}</span>
        </label>
      `
        )
        .join('')}
    </div>
  `;
  skillCheckChoice = null;
  const firstOption = container.querySelector('input[name="skill-q"]');
  if (firstOption) requestAnimationFrame(() => firstOption.focus());
}

function advanceSkillCheck() {
  const selected = document.querySelector('input[name="skill-q"]:checked');
  if (!selected) return;
  skillCheckScore += Number(selected.value);
  skillCheckIndex += 1;

  if (skillCheckIndex >= SKILL_QUESTIONS.length) {
    currentUser.skillLevel = skillLevelFromScore(skillCheckScore);
    currentUser.skillCheckDone = true;
    if (!currentUser.genres.length) {
      currentUser.genres = ['acoustic-folk', 'rock-alt'];
    }
    const diff = document.getElementById('practice-difficulty');
    if (diff) diff.value = defaultDifficultyForSkill(currentUser.skillLevel);
    rebuildLearningPrompt();
    persistCurrentUser();
    closeDialog('skill-check-modal');
    renderAll();
    refreshPracticeSession();
    return;
  }

  renderSkillCheckStep();
}

function rebuildLearningPrompt(opts = {}) {
  if (!currentUser) return;
  applyLearningPrompt(currentUser, opts);
}

function schedulePromptRefresh() {
  if (!currentUser?.preferences?.continuousAiAdaptation) return;
  if (!shouldAutoRefreshPrompt(currentUser)) return;
  clearTimeout(promptRefreshTimer);
  promptRefreshTimer = setTimeout(() => {
    if (!currentUser?.preferences?.continuousAiAdaptation) return;
    if (!shouldAutoRefreshPrompt(currentUser)) return;
    rebuildLearningPrompt();
    persistCurrentUser();
    renderPreferences();
  }, 400);
}

function regenerateLearningPrompt() {
  if (!currentUser) return;
  rebuildLearningPrompt({ force: true });
  persistCurrentUser();
  renderPreferences();
}

function resetLearningPrompt() {
  if (!currentUser) return;
  // Default template from skill/genres only (ignore recent practice / roadmap title).
  const snapshot = {
    ...currentUser,
    practiceHistory: [],
    roadmap: null,
    preferences: { ...currentUser.preferences, continuousAiAdaptation: true }
  };
  const fresh = buildLearningPrompt(snapshot, { force: true });
  if (currentUser.preferences.continuousAiAdaptation) {
    currentUser.learningPrompt = fresh.text;
    currentUser.learningPromptMeta = {
      generatedAt: fresh.generatedAt,
      inputsHash: fresh.inputsHash,
      source: fresh.source
    };
    // Align hash with live profile so the next practice event can refresh again
    rebuildLearningPrompt({ force: true });
  } else {
    rebuildLearningPrompt();
  }
  persistCurrentUser();
  renderPreferences();
}

function savePreferences() {
  if (!currentUser) return;
  const skill = document.querySelector('input[name="skill"]:checked');
  currentUser.skillLevel = skill ? skill.value : currentUser.skillLevel;
  currentUser.genres = Array.from(document.querySelectorAll('.genre-check:checked')).map(
    (el) => el.value
  );
  currentUser.preferences.continuousAiAdaptation = document.getElementById('pref-ai').checked;
  currentUser.preferences.cloudSync = document.getElementById('pref-cloud').checked;
  rebuildLearningPrompt();
  persistCurrentUser();
  const diff = document.getElementById('practice-difficulty');
  if (diff) diff.value = defaultDifficultyForSkill(currentUser.skillLevel);
  renderAll();
  refreshPracticeSession();

  const saved = document.getElementById('prefs-saved');
  saved.classList.remove('hidden');
  setTimeout(() => saved.classList.add('hidden'), 1500);
}

function generateRoadmap() {
  if (!currentUser) return;
  if (!currentUser.skillLevel) {
    alert('Set a skill level first (Preferences or skill check).');
    switchView('profile');
    return;
  }
  if (!currentUser.genres.length) {
    alert('Pick at least one genre in Preferences.');
    switchView('profile');
    return;
  }

  if (currentUser.roadmap) {
    const ok = confirm(
      'Generating a new roadmap will replace your current plan and progress. Continue?'
    );
    if (!ok) return;
  }

  try {
    currentUser.roadmap = buildRoadmap({
      skillLevel: currentUser.skillLevel,
      genres: currentUser.genres
    });
  } catch (err) {
    alert(err.message || 'Could not generate roadmap.');
    switchView('profile');
    return;
  }

  persistCurrentUser();
  renderAll();
  switchView('roadmap');
}

function renderRoadmap() {
  const body = document.getElementById('roadmap-body');
  const subtitle = document.getElementById('roadmap-subtitle');
  const roadmap = currentUser?.roadmap;

  if (!roadmap) {
    subtitle.textContent = 'Generate a plan from your skill and genres.';
    body.innerHTML =
      '<p class="text-app-muted text-sm">No roadmap yet. Set preferences, then generate one.</p>';
    return;
  }

  subtitle.textContent = `Targeting: ${roadmap.title}`;
  body.innerHTML = `
    <div class="relative border-l border-app-border ml-3 space-y-8">
      ${roadmap.phases
        .map((phase) => {
          const icon =
            phase.status === 'completed'
              ? '<i data-lucide="check-circle-2" class="w-6 h-6 text-path-green"></i>'
              : phase.status === 'in-progress' || phase.status === 'available'
                ? '<i data-lucide="circle-dot" class="w-6 h-6 text-app-accent"></i>'
                : '<i data-lucide="circle" class="w-6 h-6 text-app-border"></i>';
          const badge =
            phase.status === 'completed'
              ? '<span class="text-xs text-path-green font-medium border border-path-green rounded px-2 py-1">Completed</span>'
              : phase.status === 'in-progress'
                ? '<span class="text-xs text-app-accent font-medium border border-app-accent rounded px-2 py-1">In Progress</span>'
                : phase.status === 'available'
                  ? '<span class="text-xs text-app-muted font-medium border border-app-border rounded px-2 py-1">Ready</span>'
                  : '<i data-lucide="lock" class="w-4 h-4 text-app-muted"></i>';
          const muted = phase.status === 'locked' ? 'opacity-50' : '';
          return `
            <div class="relative pl-8 ${muted}">
              <span class="absolute -left-3 top-1 bg-app-bg rounded-full">${icon}</span>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-serif text-xl font-medium tracking-tightest ${
                  phase.status === 'in-progress' || phase.status === 'available'
                    ? 'text-white'
                    : 'text-app-muted'
                }">${phase.title}</h3>
                ${badge}
              </div>
              <div class="space-y-3">
                ${phase.lessons
                  .map((lesson) => {
                    const clickable =
                      lesson.status === 'available' || lesson.status === 'completed';
                    const iconName =
                      lesson.status === 'locked'
                        ? 'lock'
                        : lesson.status === 'completed'
                          ? 'check'
                          : 'play';
                    const textClass =
                      lesson.status === 'locked' ? 'text-app-muted' : 'font-medium';
                    return `
                      <div class="roadmap-station bg-app-field border border-app-border rounded-md p-4 flex items-center justify-between ${
                        clickable
                          ? 'group cursor-pointer hover:border-app-accent transition-colors'
                          : ''
                      }"
                           ${
                             clickable
                               ? `onclick="openLesson('${phase.id}','${lesson.id}')"`
                               : ''
                           }>
                        <div class="flex items-center">
                          <i data-lucide="${iconName}" class="w-4 h-4 text-app-muted ${
                            clickable ? 'group-hover:text-app-accent' : ''
                          } mr-3 transition-colors"></i>
                          <span class="${textClass}">${lesson.title}</span>
                        </div>
                        <span class="text-xs text-app-muted">${
                          lesson.status === 'locked' ? 'Locked' : lesson.duration
                        }</span>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
  lucide.createIcons();
}

function stopLessonTimer() {
  if (lessonTimerId) clearInterval(lessonTimerId);
  lessonTimerId = null;
  lessonTimerRunning = false;
  lessonBeat = 0;
  const btn = document.getElementById('lesson-timer-btn');
  if (btn) btn.textContent = 'Start';
  const ind = document.getElementById('lesson-beat-indicator');
  if (ind) ind.textContent = '—';
}

function getActiveLessonRecord() {
  if (!activeLesson || !currentUser?.roadmap) return null;
  const phase = currentUser.roadmap.phases.find((p) => p.id === activeLesson.phaseId);
  const lesson = phase?.lessons.find((l) => l.id === activeLesson.lessonId);
  if (!lesson || !phase) return null;
  return { phase, lesson };
}

function renderLessonCue(cue) {
  const el = document.getElementById('lesson-cue');
  if (!el || !cue) return;
  if (cue.kind === 'capo') {
    el.innerHTML = `
      <p class="text-xs text-app-muted uppercase tracking-wider">${cue.patternLabel}</p>
      <p class="font-serif text-3xl font-semibold tracking-tightest text-white">${cue.display}</p>
      <p class="text-sm text-app-muted">Shape <span class="text-app-text font-medium">${cue.shapeChord}</span> at capo ${cue.capoFret} sounds as <span class="text-app-accent font-medium">${cue.soundingChord}</span></p>
    `;
    return;
  }
  const beats = cue.beats || [];
  el.innerHTML = `
    <p class="text-xs text-app-muted uppercase tracking-wider mb-3">${cue.patternLabel}</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      ${beats
        .map(
          (b, i) => `
        <span data-beat-index="${i}" class="lesson-beat-cell min-w-[2.5rem] px-3 py-2 rounded-md border border-app-border bg-[#1A1A1A] font-serif text-xl font-semibold">${b}</span>
      `
        )
        .join('')}
    </div>
  `;
}

function highlightLessonBeat() {
  const cells = document.querySelectorAll('.lesson-beat-cell');
  if (!cells.length) {
    document.getElementById('lesson-beat-indicator').textContent = String(lessonBeat + 1);
    return;
  }
  cells.forEach((cell, i) => {
    if (i === lessonBeat % cells.length) {
      cell.classList.add('border-app-accent', 'text-app-accent');
      cell.classList.remove('border-app-border');
    } else {
      cell.classList.remove('border-app-accent', 'text-app-accent');
      cell.classList.add('border-app-border');
    }
  });
  document.getElementById('lesson-beat-indicator').textContent = `Beat ${(lessonBeat % cells.length) + 1}`;
}

function toggleLessonTimer() {
  if (lessonTimerRunning) {
    stopLessonTimer();
    return;
  }
  const bpm = Number(document.getElementById('lesson-bpm')?.value) || lessonDrill?.defaultBpm || 72;
  lessonTimerRunning = true;
  document.getElementById('lesson-timer-btn').textContent = 'Pause';
  lessonBeat = 0;
  highlightLessonBeat();
  lessonTimerId = setInterval(() => {
    lessonBeat += 1;
    highlightLessonBeat();
  }, msPerBeat(bpm));
}

function onLessonBpmChange() {
  if (!lessonTimerRunning) return;
  stopLessonTimer();
  toggleLessonTimer();
}

function renderLessonPlayer() {
  const rec = getActiveLessonRecord();
  if (!rec || !lessonDrill) return;
  const { phase, lesson } = rec;
  if (!Array.isArray(lesson.stepsDone)) lesson.stepsDone = [];

  const steps = lessonDrill.steps;
  lessonStepIndex = clampStepIndex(lessonStepIndex, steps.length);

  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-meta').textContent =
    `${phase.title} · ${lesson.duration} · ${lessonDrill.label}`;
  document.getElementById('lesson-step-progress').textContent =
    `Step ${lessonStepIndex + 1} of ${steps.length}`;
  document.getElementById('lesson-current-step').textContent = steps[lessonStepIndex];
  renderLessonCue(lessonDrill.cue);

  const bpmInput = document.getElementById('lesson-bpm');
  if (bpmInput && !lessonTimerRunning) {
    if (!bpmInput.dataset.touched) bpmInput.value = String(lessonDrill.defaultBpm);
  }

  document.getElementById('lesson-steps').innerHTML = steps
    .map((step, i) => {
      const done = lesson.stepsDone.includes(i);
      const current = i === lessonStepIndex;
      return `
      <li class="flex items-start gap-2 text-sm px-2 py-1.5 rounded ${current ? 'bg-[#1A1A1A] border border-app-border' : ''}">
        <span class="text-app-accent font-medium w-5">${done ? '✓' : i + 1}</span>
        <span class="${done ? 'text-app-muted line-through' : current ? 'text-app-text' : 'text-app-muted'}">${step}</span>
      </li>
    `;
    })
    .join('');

  const completeBtn = document.getElementById('lesson-mark-complete');
  if (completeBtn) {
    completeBtn.disabled = !allStepsComplete(lesson.stepsDone, steps.length);
  }
  lucide.createIcons();
}

function openLesson(phaseId, lessonId) {
  const phase = currentUser.roadmap?.phases.find((p) => p.id === phaseId);
  const lesson = phase?.lessons.find((l) => l.id === lessonId);
  if (!lesson || lesson.status === 'locked') return;

  stopLessonTimer();
  activeLesson = { phaseId, lessonId };
  if (!Array.isArray(lesson.stepsDone)) lesson.stepsDone = [];
  lessonDrill = getLessonDrill(lesson.type);
  const firstIncomplete = lessonDrill.steps.findIndex((_, i) => !lesson.stepsDone.includes(i));
  lessonStepIndex = firstIncomplete >= 0 ? firstIncomplete : 0;
  const bpmInput = document.getElementById('lesson-bpm');
  if (bpmInput) {
    delete bpmInput.dataset.touched;
    bpmInput.value = String(lessonDrill.defaultBpm);
    bpmInput.oninput = () => {
      bpmInput.dataset.touched = '1';
    };
  }
  renderLessonPlayer();
  switchView('lesson');
}

function lessonCompleteStep() {
  const rec = getActiveLessonRecord();
  if (!rec || !lessonDrill) return;
  const { lesson } = rec;
  if (!Array.isArray(lesson.stepsDone)) lesson.stepsDone = [];
  if (!lesson.stepsDone.includes(lessonStepIndex)) {
    lesson.stepsDone.push(lessonStepIndex);
  }
  persistCurrentUser();
  if (lessonStepIndex < lessonDrill.steps.length - 1) {
    lessonStepIndex = nextStepIndex(lessonStepIndex, lessonDrill.steps.length);
  }
  renderLessonPlayer();
}

function lessonPrevStep() {
  if (!lessonDrill) return;
  lessonStepIndex = prevStepIndex(lessonStepIndex, lessonDrill.steps.length);
  renderLessonPlayer();
}

function toggleLessonStep(index, checked) {
  const rec = getActiveLessonRecord();
  if (!rec) return;
  const { lesson } = rec;
  if (!Array.isArray(lesson.stepsDone)) lesson.stepsDone = [];
  if (checked && !lesson.stepsDone.includes(index)) lesson.stepsDone.push(index);
  if (!checked) lesson.stepsDone = lesson.stepsDone.filter((i) => i !== index);
  persistCurrentUser();
  renderLessonPlayer();
}

function openNextLesson() {
  const roadmap = currentUser?.roadmap;
  if (!roadmap) {
    switchView('roadmap');
    return;
  }
  const next = findNextLesson(roadmap);
  if (next) {
    openLesson(next.phase.id, next.lesson.id);
    return;
  }
  switchView('roadmap');
}

function completeCurrentLesson() {
  const rec = getActiveLessonRecord();
  if (!rec) return;
  const { lesson } = rec;
  const steps = lessonDrill?.steps || getLessonDrill(lesson.type).steps;
  if (!allStepsComplete(lesson.stepsDone || [], steps.length)) {
    lesson.stepsDone = steps.map((_, i) => i);
  }
  lesson.status = 'completed';
  currentUser.practiceHistory = appendPracticeEvent(currentUser.practiceHistory, {
    type: 'lesson',
    summary: lesson.title,
    meta: { phaseId: activeLesson.phaseId, lessonId: activeLesson.lessonId }
  });
  refreshRoadmapAvailability(currentUser.roadmap);
  stopLessonTimer();
  persistCurrentUser();
  schedulePromptRefresh();
  renderAll();
  switchView('roadmap');
}

function setPracticeMode(mode) {
  practiceMode = mode;
  document.getElementById('practice-mode-chord').className =
    mode === 'chord'
      ? 'px-4 py-2 rounded-md text-sm font-medium bg-app-accent text-white'
      : 'px-4 py-2 rounded-md text-sm font-medium border border-app-border text-app-muted hover:text-app-text';
  document.getElementById('practice-mode-strum').className =
    mode === 'strum'
      ? 'px-4 py-2 rounded-md text-sm font-medium bg-app-accent text-white'
      : 'px-4 py-2 rounded-md text-sm font-medium border border-app-border text-app-muted hover:text-app-text';
  refreshPracticeSession();
}

function nudgeTranspose(delta) {
  const next = practiceTranspose + delta;
  const { value, clamped } = clampTranspose(next);
  practiceTranspose = value;
  const hint = document.getElementById('practice-transpose-hint');
  if (hint) hint.classList.toggle('hidden', !clamped && next === value);
  if (clamped || next !== value) hint?.classList.remove('hidden');
  refreshPracticeSession();
}

function refreshPracticeSession() {
  if (!currentUser) return;
  const difficulty = document.getElementById('practice-difficulty')?.value || 'standard';
  practiceSession = buildExerciseSession({
    mode: practiceMode,
    difficulty,
    skillLevel: currentUser.skillLevel,
    transpose: practiceTranspose
  });
  practiceTranspose = practiceSession.transpose;

  document.getElementById('practice-transpose').textContent =
    practiceTranspose === 0 ? '0' : (practiceTranspose > 0 ? '+' : '') + practiceTranspose;
  document.getElementById('practice-bpm').textContent = `${practiceSession.bpm} BPM`;
  const hint = document.getElementById('practice-transpose-hint');
  if (hint && practiceSession.transposeClamped) hint.classList.remove('hidden');

  const stage = document.getElementById('practice-stage');
  if (!stage) return;

  if (practiceSession.mode === 'strum') {
    stage.innerHTML = `
      <div class="text-center px-4">
        <p class="text-sm text-app-muted mb-2">${practiceSession.label}</p>
        <p class="text-3xl font-serif font-semibold tracking-wide">${practiceSession.pattern}</p>
      </div>
    `;
    return;
  }

  const chords = practiceSession.chordProgression;
  stage.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-4 px-4">
      ${chords
        .map(
          (chord, i) => `
        <div class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-4xl sm:text-5xl font-bold font-serif mb-2 ${
              i === 0 ? 'text-white' : 'text-app-muted'
            }">${chord}</div>
            <div class="text-xs text-app-muted">4 beats</div>
          </div>
          ${
            i < chords.length - 1
              ? '<div class="flex space-x-1 text-app-accent"><i data-lucide="chevron-right" class="w-5 h-5"></i></div>'
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>
  `;
  lucide.createIcons();
}

function openPractice(mode) {
  setPracticeMode(mode || 'chord');
  switchView('practice');
}

function logCurrentPractice() {
  if (!currentUser || !practiceSession) refreshPracticeSession();
  if (!practiceSession) return;
  currentUser.practiceHistory = appendPracticeEvent(currentUser.practiceHistory, {
    type: practiceSession.mode === 'strum' ? 'strumming' : 'chord-transition',
    summary: practiceSession.summary,
    meta: {
      difficulty: practiceSession.difficulty,
      transpose: practiceSession.transpose,
      mode: practiceSession.mode
    }
  });
  persistCurrentUser();
  schedulePromptRefresh();
  renderAll();
  alert('Practice logged to your local profile.');
}

function exportProfile() {
  if (!currentUser) return;
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: { ...currentUser, passwordHash: undefined }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `riffle-profile-${currentUser.displayName.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProfile(event) {
  const file = event.target.files?.[0];
  if (!file || !currentUser) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = data.profile || data;
      if (!incoming || typeof incoming !== 'object') throw new Error('Invalid file');

      currentUser.displayName = incoming.displayName || currentUser.displayName;
      currentUser.skillLevel = incoming.skillLevel || currentUser.skillLevel;
      currentUser.genres = incoming.genres || currentUser.genres;
      currentUser.skillCheckDone = incoming.skillCheckDone ?? currentUser.skillCheckDone;
      currentUser.preferences = {
        ...currentUser.preferences,
        ...(incoming.preferences || {})
      };
      currentUser.practiceHistory =
        incoming.practiceHistory || currentUser.practiceHistory;
      currentUser.roadmap = incoming.roadmap || currentUser.roadmap;
      currentUser.chordBank = incoming.chordBank || currentUser.chordBank;
      currentUser.library = incoming.library || currentUser.library;
      currentUser.dayCount = incoming.dayCount || currentUser.dayCount;
      rebuildLearningPrompt();
      persistCurrentUser();
      renderAll();
      refreshPracticeSession();
      alert('Profile imported into this local account.');
    } catch {
      alert('Could not import that JSON file.');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function renderSidebar() {
  document.getElementById('sidebar-name').textContent = currentUser.displayName;
  document.getElementById('sidebar-plan').textContent = currentUser.isGuest
    ? 'Guest (local)'
    : 'Local profile';
}

function updateLocalClock() {
  const el = document.getElementById('local-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function selectCorridorStation(stationId, { silent } = {}) {
  selectedStationId = stationId;
  const station = corridorModel?.stations?.find((s) => s.id === stationId) || null;
  const title = document.getElementById('map-callout-title');
  const hint = document.getElementById('map-callout-hint');
  const label = document.getElementById('map-callout-label');
  const action = document.getElementById('map-callout-action');
  if (!station) {
    if (title) title.textContent = '—';
    if (hint) hint.textContent = 'Pick a station on the map.';
    if (action) {
      action.disabled = true;
      action.textContent = 'Open lesson';
    }
    return;
  }
  if (label) {
    label.textContent = station.isNext
      ? 'Next station'
      : station.kind === 'action'
        ? 'Start here'
        : 'Selected station';
  }
  if (title) title.textContent = station.label;
  if (hint) hint.textContent = station.sub;
  if (action) {
    const locked = station.action === 'locked';
    action.disabled = locked;
    if (station.action === 'generate') action.textContent = 'Generate roadmap';
    else if (station.action === 'preferences') action.textContent = 'Open Preferences';
    else if (locked) action.textContent = 'Locked';
    else action.textContent = 'Open lesson';
  }
  document.querySelectorAll('#corridor-map-svg .corridor-station').forEach((node) => {
    node.classList.toggle('is-selected', node.dataset.stationId === stationId);
  });
  if (!silent) lucide.createIcons();
}

function activateSelectedStation() {
  const station = corridorModel?.stations?.find((s) => s.id === selectedStationId);
  if (!station || station.action === 'locked') return;
  if (station.action === 'generate') {
    generateRoadmap();
    return;
  }
  if (station.action === 'preferences') {
    switchView('profile');
    return;
  }
  if (station.phaseId && station.lessonId) {
    openLesson(station.phaseId, station.lessonId);
  }
}

function renderCorridorMap() {
  corridorModel = buildCorridorMap({
    roadmap: currentUser?.roadmap,
    genres: currentUser?.genres || []
  });

  const legend = document.getElementById('corridor-legend');
  if (legend) {
    legend.innerHTML = (corridorModel.legend || [])
      .map(
        (item) => `
      <span class="legend-item">
        <span class="swatch" style="background:${item.color}"></span>
        ${escapeXml(item.label)}
      </span>`
      )
      .join('');
  }

  const courseLabel = document.getElementById('overview-course-label');
  if (courseLabel) {
    courseLabel.textContent = corridorModel.courseTitle
      ? corridorModel.courseTitle
      : 'Your learning corridor';
  }

  const svg = document.getElementById('corridor-map-svg');
  if (!svg) return;
  svg.setAttribute('viewBox', corridorModel.viewBox);

  const routesMarkup = corridorModel.routes
    .map(
      (route) => `
    <path class="corridor-route${route.dashed ? ' is-dashed' : ''}" data-route-id="${escapeXml(
      route.id
    )}" d="${route.d}" stroke="${route.color}"></path>`
    )
    .join('');

  const stationsMarkup = corridorModel.stations
    .map((station) => {
      const labelY = station.y - 22;
      const trunc =
        station.label.length > 28 ? `${station.label.slice(0, 26)}…` : station.label;
      const locked = station.status === 'locked';
      const classes = [
        'corridor-station',
        locked ? 'is-locked' : '',
        station.isNext ? 'is-next' : ''
      ]
        .filter(Boolean)
        .join(' ');
      return `
      <g class="${classes}"
         data-station-id="${escapeXml(station.id)}"
         tabindex="${locked ? -1 : 0}"
         role="button"
         aria-label="${escapeXml(station.label)} — ${escapeXml(station.sub)}"
         aria-disabled="${locked ? 'true' : 'false'}">
        <circle class="station-ring" cx="${station.x}" cy="${station.y}" r="16" fill="transparent" stroke="transparent"></circle>
        <circle class="station-disk" cx="${station.x}" cy="${station.y}" r="11" fill="${
          locked ? '#B9AE9F' : station.color
        }"></circle>
        ${
          station.status === 'completed'
            ? `<circle cx="${station.x}" cy="${station.y}" r="4.5" fill="#F3EEE6"></circle>`
            : ''
        }
        <text class="station-label" x="${station.x}" y="${labelY}" text-anchor="middle">${escapeXml(
          trunc
        )}</text>
      </g>`;
    })
    .join('');

  svg.innerHTML = `
    <rect x="0" y="0" width="1000" height="640" fill="transparent"></rect>
    ${routesMarkup}
    ${stationsMarkup}
  `;

  svg.querySelectorAll('.corridor-station').forEach((node) => {
    const id = node.dataset.stationId;
    node.addEventListener('click', () => {
      const station = corridorModel.stations.find((s) => s.id === id);
      selectCorridorStation(id);
      if (!station || station.action === 'locked') return;
      if (station.kind === 'action' || station.isNext) activateSelectedStation();
    });
    node.addEventListener('dblclick', () => {
      selectCorridorStation(id);
      activateSelectedStation();
    });
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCorridorStation(id);
        activateSelectedStation();
      }
    });
  });

  const preferred =
    (corridorModel.next &&
      corridorModel.stations.find(
        (s) => s.phaseId === corridorModel.next.phaseId && s.lessonId === corridorModel.next.lessonId
      )?.id) ||
    corridorModel.stations.find((s) => s.action !== 'locked')?.id ||
    corridorModel.stations[0]?.id ||
    null;
  selectCorridorStation(preferred, { silent: true });
}

function renderDashboard() {
  document.getElementById('dashboard-welcome').textContent =
    `Welcome back, ${currentUser.displayName}. You are on Day ${currentUser.dayCount} of your learning plan.`;

  document.getElementById('stat-skill').textContent = currentUser.skillLevel
    ? currentUser.skillLevel[0].toUpperCase() + currentUser.skillLevel.slice(1)
    : 'Not set';
  document.getElementById('stat-genres').textContent = currentUser.genres.length
    ? currentUser.genres.map((g) => GENRE_LABELS[g] || g).join(', ')
    : 'Not set';
  document.getElementById('stat-chords').textContent = String(
    (currentUser.chordBank || []).length
  );

  const scans = document.getElementById('recent-scans');
  if (currentUser.library?.length) {
    scans.innerHTML = currentUser.library
      .slice(-3)
      .reverse()
      .map(
        (item) => `
      <li class="flex items-center text-sm">
        <i data-lucide="file-text" class="w-4 h-4 text-app-muted mr-3"></i>
        <span class="truncate flex-1">${item.name || item.title || item}</span>
      </li>
    `
      )
      .join('');
  } else {
    scans.innerHTML =
      '<li class="text-sm text-app-muted">No scans yet — library uploads land in spec 002.</li>';
  }

  const activity = document.getElementById('recent-activity');
  if (activity) {
    const events = (currentUser.practiceHistory || []).slice(-8).reverse();
    if (!events.length) {
      activity.innerHTML =
        '<li class="text-sm text-app-muted">No practice logged yet. Complete a lesson or drill to see it here.</li>';
    } else {
      activity.innerHTML = events
        .map((e) => {
          const when = new Date(e.at).toLocaleString();
          return `
          <li class="flex items-start text-sm gap-3">
            <i data-lucide="activity" class="w-4 h-4 text-app-muted mt-0.5"></i>
            <div>
              <p class="font-medium">${e.summary || e.label}</p>
              <p class="text-xs text-app-muted">${e.type} · ${when}</p>
            </div>
          </li>
        `;
        })
        .join('');
    }
  }

  const nextTitle = document.getElementById('dashboard-next-title');
  const nextSub = document.getElementById('dashboard-next-sub');
  const nextBtnLabel = document.getElementById('dashboard-next-btn-label');
  const found = currentUser.roadmap ? findNextLesson(currentUser.roadmap) : null;

  if (found) {
    nextTitle.textContent = found.lesson.title;
    nextSub.textContent = `Next on the corridor: ${found.lesson.title} (${found.lesson.duration}).`;
    nextBtnLabel.textContent = 'Resume Practice';
  } else if (currentUser.roadmap) {
    nextTitle.textContent = 'Roadmap complete';
    nextSub.textContent = `${currentUser.roadmap.title} is complete. Generate a new course when you are ready.`;
    nextBtnLabel.textContent = 'View Roadmap';
  } else {
    nextTitle.textContent = 'Generate a roadmap';
    nextSub.textContent = 'Set skill and genres, then build a course — stations appear on the map.';
    nextBtnLabel.textContent = 'Open Roadmap';
  }

  updateLocalClock();
  renderCorridorMap();
}

function renderPreferences() {
  document.querySelectorAll('input[name="skill"]').forEach((input) => {
    input.checked = input.value === currentUser.skillLevel;
  });
  document.querySelectorAll('.genre-check').forEach((input) => {
    input.checked = currentUser.genres.includes(input.value);
  });
  document.getElementById('pref-ai').checked = !!currentUser.preferences.continuousAiAdaptation;
  document.getElementById('pref-cloud').checked = !!currentUser.preferences.cloudSync;
  document
    .getElementById('cloud-tools')
    .classList.toggle('hidden', !currentUser.preferences.cloudSync);
  document.getElementById('learning-prompt').textContent =
    currentUser.learningPrompt || 'Save preferences to generate a prompt.';
  const metaEl = document.getElementById('learning-prompt-meta');
  if (metaEl) {
    const meta = currentUser.learningPromptMeta;
    if (meta?.generatedAt) {
      const when = new Date(meta.generatedAt).toLocaleString();
      metaEl.textContent = `Source: ${meta.source} · Updated ${when}`;
    } else {
      metaEl.textContent = 'Not generated yet.';
    }
  }
}

function renderLibrary() {
  const list = document.getElementById('library-list');
  if (!currentUser.library?.length) {
    list.innerHTML =
      '<li class="p-4 text-sm text-app-muted">Empty — waiting on library work (spec 002).</li>';
    document.getElementById('library-detail-title').textContent = 'No file selected';
    return;
  }
  list.innerHTML = currentUser.library
    .map((item) => {
      const name = (item.name || item.title || item).toString().replace(/'/g, "\\'");
      return `
      <li class="p-4 hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-between transition-colors" onclick="document.getElementById('library-detail-title').textContent='${name}'">
        <div class="flex items-center">
          <i data-lucide="file-text" class="w-5 h-5 text-app-muted mr-3"></i>
          <span class="font-medium text-sm">${item.name || item.title || item}</span>
        </div>
      </li>
    `;
    })
    .join('');
}

function renderAll() {
  if (!currentUser) return;
  if (currentUser.roadmap) refreshRoadmapAvailability(currentUser.roadmap);
  renderSidebar();
  renderDashboard();
  renderPreferences();
  renderRoadmap();
  renderLibrary();
  lucide.createIcons();
}

function switchView(viewId) {
  if (viewId !== 'lesson') stopLessonTimer();

  document.querySelectorAll('.view-section').forEach((el) => el.classList.add('hidden'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.remove('hidden');

  const shellRail = document.getElementById('shell-rail');
  const main = document.querySelector('#app-shell > main');
  if (shellRail) shellRail.classList.remove('hidden');
  if (main) main.classList.toggle('p-8', viewId !== 'dashboard');

  document.querySelectorAll('#shell-rail .nav-link').forEach((el) => {
    el.classList.remove('text-app-accent', 'bg-app-field', 'is-active');
    el.classList.add('text-app-muted', 'hover:text-app-text', 'hover:bg-app-field');
  });

  const navId = viewId === 'lesson' ? 'roadmap' : viewId === 'dashboard' ? 'dashboard' : viewId;
  const activeNav = document.getElementById('nav-' + navId);
  if (activeNav) {
    activeNav.classList.remove('text-app-muted', 'hover:text-app-text', 'hover:bg-app-field');
    activeNav.classList.add('text-app-accent', 'bg-app-field', 'is-active');
  }

  if (viewId === 'practice') refreshPracticeSession();
  if (viewId === 'dashboard') renderCorridorMap();
  lucide.createIcons();
}

document.getElementById('pref-cloud').addEventListener('change', () => {
  document
    .getElementById('cloud-tools')
    .classList.toggle('hidden', !document.getElementById('pref-cloud').checked);
});

document.addEventListener('keydown', (event) => {
  if (!activeDialogId) return;
  const dialog = document.getElementById(activeDialogId);
  if (!dialog || dialog.classList.contains('hidden')) return;

  if (event.key === 'Escape') {
    if (activeDialogId === 'skill-check-modal') {
      event.preventDefault();
      return;
    }
    if (activeDialogId === 'auth-gate') {
      event.preventDefault();
      return;
    }
  }

  if (event.key !== 'Tab') return;
  const focusables = getFocusable(dialog);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function boot() {
  lucide.createIcons();
  updateLocalClock();
  if (clockTimerId) clearInterval(clockTimerId);
  clockTimerId = setInterval(updateLocalClock, 30000);
  try {
    const sessionId = store.getSession();
    const profile = sessionId ? store.getProfile(sessionId) : null;
    if (profile) {
      enterApp(profile);
    } else {
      setAuthTab('signin');
      openDialog('auth-gate', { initialFocus: '#auth-email' });
    }
  } catch (err) {
    if (err.code === 'STORAGE_CORRUPT') {
      alert('Local profile data looks corrupt. Clear site data for this page or continue as a new guest.');
    }
    setAuthTab('signin');
    openDialog('auth-gate', { initialFocus: '#auth-email' });
  }
}

Object.assign(window, {
  setAuthTab,
  handleAuthSubmit,
  continueAsGuest,
  signOut,
  advanceSkillCheck,
  rerunSkillCheck,
  savePreferences,
  generateRoadmap,
  openLesson,
  openNextLesson,
  completeCurrentLesson,
  toggleLessonStep,
  lessonCompleteStep,
  lessonPrevStep,
  toggleLessonTimer,
  onLessonBpmChange,
  regenerateLearningPrompt,
  resetLearningPrompt,
  setPracticeMode,
  nudgeTranspose,
  refreshPracticeSession,
  openPractice,
  logCurrentPractice,
  exportProfile,
  importProfile,
  switchView,
  activateSelectedStation
});

Object.defineProperty(window, 'skillCheckChoice', {
  get() {
    return skillCheckChoice;
  },
  set(v) {
    skillCheckChoice = v;
  },
  configurable: true
});

boot();
