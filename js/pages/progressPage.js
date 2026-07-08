import { achievements } from "../data/achievements.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildAchievementSummaries } from "../engines/achievementEngine.js";
import { buildProgressSummary } from "../engines/progressEngine.js";
import { getStreakMessage } from "../engines/streakEngine.js";

function renderAchievementCard(achievement) {
  const unlocked = achievement.progress.unlocked;

  return `
    <article class="achievement-card ${unlocked ? "is-unlocked" : "is-locked"}">
      <div class="track-header">
        <h3>${achievement.icon} ${achievement.arabicTitle}</h3>
        <span class="status-badge ${unlocked ? "is-open" : "is-locked"}">${unlocked ? "مفتوح" : "مقفل"}</span>
      </div>
      <p>${achievement.requirement}</p>
      <div class="progress-bar" aria-label="Achievement progress">
        <span style="width: ${achievement.progress.percent}%"></span>
      </div>
      <p style="margin-top: 10px;">${achievement.progress.value}/${achievement.progress.target}</p>
    </article>
  `;
}

export function renderProgressPage(state) {
  const summary = buildProgressSummary(state, {
    lessons: lessons.length,
    quizzes: quizzes.length
  });
  const achievementSummaries = buildAchievementSummaries(achievements, state);
  const unlockedAchievements = achievementSummaries.filter((achievement) => achievement.progress.unlocked);
  const lockedAchievements = achievementSummaries.filter((achievement) => !achievement.progress.unlocked);

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
        <div class="stat-card">Achievements<strong>${unlockedAchievements.length}/${achievements.length}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>Quiz Progress</h2>
      <div class="progress-bar" aria-label="Quiz progress"><span style="width: ${summary.quizProgressPercent}%"></span></div>
      <p style="margin-top: 10px;">Completed quizzes: ${summary.completedQuizzes}/${quizzes.length}</p>
    </section>

    <section class="content-card">
      <h2>🏆 الإنجازات المفتوحة</h2>
      ${unlockedAchievements.length === 0
        ? `<p class="empty-state">لا توجد إنجازات مفتوحة بعد. أكمل أول درس لتبدأ.</p>`
        : `<div class="card-grid">${unlockedAchievements.map(renderAchievementCard).join("")}</div>`
      }
    </section>

    <section class="content-card">
      <h2>الإنجازات القادمة</h2>
      <div class="card-grid">
        ${lockedAchievements.map(renderAchievementCard).join("")}
      </div>
    </section>
  `;
}
