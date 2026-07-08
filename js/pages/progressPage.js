import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildProgressSummary } from "../engines/progressEngine.js";
import { getStreakMessage } from "../engines/streakEngine.js";

export function renderProgressPage(state) {
  const summary = buildProgressSummary(state, {
    lessons: lessons.length,
    quizzes: quizzes.length
  });

  return `
    <section class="content-card">
      <p class="section-label">Progress Dashboard</p>
      <h2 class="page-title">Progress</h2>
      <p>Your learning progress is saved locally on this device.</p>
      <div class="progress-bar" aria-label="Lesson progress"><span style="width: ${summary.lessonProgressPercent}%"></span></div>
      <p style="margin-top: 10px;">Lesson progress: ${summary.lessonProgressPercent}%</p>
    </section>

    <section class="content-card">
      <h2>Daily Streak</h2>
      <p>${getStreakMessage(state)}</p>
      <div class="stat-grid">
        <div class="stat-card">Current<strong>${state.streak || 0}</strong></div>
        <div class="stat-card">Best<strong>${state.bestStreak || 0}</strong></div>
        <div class="stat-card">Last Day<strong>${state.lastActivityDate || "None"}</strong></div>
        <div class="stat-card">Status<strong>${state.lastActivityDate ? "Tracked" : "New"}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>Level</h2>
      <div class="stat-grid">
        <div class="stat-card">Level<strong>${summary.level.title}</strong></div>
        <div class="stat-card">Next<strong>${summary.pointsToNextLevel} XP</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>Stats</h2>
      <div class="stat-grid">
        <div class="stat-card">XP<strong>${summary.points}</strong></div>
        <div class="stat-card">Streak<strong>${state.streak || 0}</strong></div>
        <div class="stat-card">Lessons<strong>${summary.completedLessons}/${lessons.length}</strong></div>
        <div class="stat-card">Quizzes<strong>${summary.completedQuizzes}/${quizzes.length}</strong></div>
        <div class="stat-card">Saved<strong>${summary.savedWords}</strong></div>
        <div class="stat-card">Rewards<strong>${state.xpEvents?.length || 0}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>Quiz Progress</h2>
      <div class="progress-bar" aria-label="Quiz progress"><span style="width: ${summary.quizProgressPercent}%"></span></div>
      <p style="margin-top: 10px;">Completed quizzes: ${summary.completedQuizzes}/${quizzes.length}</p>
    </section>

    <section class="content-card">
      <h2>Next Achievements</h2>
      <ul class="page-list">
        <li>First Lesson - complete one lesson</li>
        <li>First Quiz - complete one quiz</li>
        <li>3-Day Streak - learn for three days</li>
        <li>10 Saved Words - save ten words</li>
      </ul>
    </section>
  `;
}
