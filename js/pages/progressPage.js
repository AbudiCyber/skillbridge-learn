import { achievements } from "../data/achievements.js";
import { lessons } from "../data/lessons.js";
import { quizzes } from "../data/quizzes.js";
import { buildAnalyticsSummary } from "../engines/analyticsEngine.js";
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

function renderActivityDay(day) {
  const percent = Math.min(100, day.count * 20);

  return `
    <article class="stat-card activity-day-card">
      <span>${day.dateKey.slice(5)}</span>
      <strong>${day.count}</strong>
      <div class="progress-bar" aria-label="Daily activity"><span style="width: ${percent}%"></span></div>
    </article>
  `;
}

function renderTimelineItem(item) {
  return `
    <article class="timeline-item">
      <div class="timeline-icon">${item.presentation.icon}</div>
      <div>
        <div class="track-header">
          <strong>${item.presentation.title}</strong>
          <span class="status-badge is-open">${item.timeLabel}</span>
        </div>
        <p>${item.presentation.description}</p>
        <div class="category-meta">
          <span>${item.dateLabel}</span>
          ${item.entityId ? `<span>${item.entityId}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderDailyGoal(goal) {
  return `
    <section class="content-card daily-goal-card">
      <div class="track-header">
        <div>
          <p class="section-label">Daily Goal</p>
          <h2>🎯 ${goal.title}</h2>
        </div>
        <span class="status-badge ${goal.isComplete ? "is-open" : "is-locked"}">
          ${goal.isComplete ? "مكتمل" : `${goal.completed}/${goal.target}`}
        </span>
      </div>
      <p>${goal.description}</p>
      <div class="review-progress-block">
        <div class="track-header">
          <strong>تقدم هدف اليوم</strong>
          <span>${goal.progressPercent}%</span>
        </div>
        <div class="progress-bar" aria-label="Daily goal progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goal.progressPercent}">
          <span style="width: ${goal.progressPercent}%"></span>
        </div>
        <p>${goal.isComplete ? "أكملت هدف اليوم ✅" : `بقي ${goal.remaining} لإكمال الهدف.`}</p>
      </div>
    </section>
  `;
}

export function renderProgressPage(state) {
  const summary = buildProgressSummary(state, {
    lessons: lessons.length,
    quizzes: quizzes.length
  });
  const analytics = buildAnalyticsSummary(state);
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

    ${renderDailyGoal(summary.dailyGoal)}

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
      <h2>📊 Lightweight Analytics</h2>
      <p>تحليلات محلية بسيطة مبنية على نشاط هذا الجهاز فقط.</p>
      <div class="stat-grid">
        <div class="stat-card">Actions<strong>${analytics.totalActions}</strong></div>
        <div class="stat-card">Best Day<strong>${analytics.bestDay?.count || 0}</strong></div>
        <div class="stat-card">Reviews<strong>${analytics.reviews}</strong></div>
        <div class="stat-card">Quiz Events<strong>${analytics.quizEvents}</strong></div>
      </div>
    </section>

    <section class="content-card">
      <h2>آخر 7 أيام</h2>
      <div class="stat-grid">
        ${analytics.lastSevenDays.map(renderActivityDay).join("")}
      </div>
    </section>

    <section class="content-card">
      <div class="track-header">
        <div>
          <p class="section-label">Activity Timeline</p>
          <h2>🧾 آخر النشاطات</h2>
        </div>
        <span class="status-badge ${analytics.timeline.length ? "is-open" : "is-locked"}">${analytics.timeline.length}</span>
      </div>
      ${analytics.timeline.length === 0
        ? `<div class="empty-state"><h3>لا توجد نشاطات بعد</h3><p>أكمل درساً، احفظ كلمة، أو راجع كلمة حتى يبدأ الخط الزمني بالظهور.</p></div>`
        : `<div class="timeline-list">${analytics.timeline.map(renderTimelineItem).join("")}</div>`
      }
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
