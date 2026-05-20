import { api } from '../services/api.js';
import { showToast, escapeHtml } from '../services/ui.js';
import { openReportModal } from './report-modal.js';

export async function renderForum(container) {
  const user = api.getUser();

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Forum</h1>
          <p class="muted">Paylaşılan aktiviteler için sohbet ve yorumlar.</p>
        </div>
        <button id="new-post-btn" class="btn btn-primary">+ İlan Oluştur</button>
      </div>
      <div id="forum-list" class="forum-list"></div>
      <div id="forum-modal" class="modal hidden"></div>
    </div>
  `;

  const newPostBtn = document.getElementById('new-post-btn');
  newPostBtn.addEventListener('click', () => {
    if (!user) {
      showToast('Yorum veya ilan gönderebilmek için giriş yapın', 'error');
      return;
    }
    openPostModal(user);
  });

  if (!user) {
    newPostBtn.disabled = true;
  }

  await loadPosts(user);
}

async function loadPosts(user) {
  const list = document.getElementById('forum-list');
  list.innerHTML = '<p class="muted">Yükleniyor...</p>';

  try {
    const [{ posts }, habitData] = await Promise.all([api.getForum(), api.getHabits()]);
    const habits = habitData.habits || [];
    window._userHabits = habits;

    if (!posts.length) {
      list.innerHTML = '<div class="card empty-state"><p>Henüz ilan yok.</p></div>';
      return;
    }

    list.innerHTML = posts.map((p) => postCard(p, user)).join('');
    bindPostEvents(posts, user, habits);
    await loadCommentsForPosts(posts, user);
  } catch (err) {
    list.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function postCard(post, user) {
  const isOwner = user && post.user_id === user.id;
  return `
    <article class="card forum-card" data-id="${post.id}">
      <header class="forum-card-header">
        <div>
          <h3>${escapeHtml(post.title)}</h3>
          <span class="badge">${escapeHtml(post.habit_name || '')}</span>
        </div>
        <div class="forum-actions">
          ${
            !isOwner && user
              ? `<button class="btn btn-ghost btn-sm report-post-btn" data-id="${post.id}" data-author-id="${post.user_id}">🚩 Bildir</button>`
              : ''
          }
          ${
            isOwner
              ? `<button class="btn btn-ghost btn-sm edit-post-btn" data-id="${post.id}">Düzenle</button>
                <button class="btn btn-danger btn-sm delete-post-btn" data-id="${post.id}">Sil</button>`
              : ''
          }
        </div>
      </header>
      <p class="forum-body">${escapeHtml(post.body)}</p>
      <footer class="forum-meta">
        <span>${escapeHtml(post.author_name)} · ${escapeHtml(post.habit_name)}</span>
        <span class="muted">${new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
      </footer>
      <div class="forum-comments" id="forum-comments-${post.id}">
        <p class="muted">Yorumlar yükleniyor...</p>
      </div>
    </article>
  `;
}

function bindPostEvents(posts, user, habits) {
  document.querySelectorAll('.edit-post-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const post = posts.find((p) => p.id === parseInt(btn.dataset.id, 10));
      if (post) openPostModal(user, post, habits);
    });
  });

  document.querySelectorAll('.delete-post-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('İlanı silmek istediğine emin misin?')) return;
      try {
        await api.deleteForumPost(parseInt(btn.dataset.id, 10));
        showToast('İlan silindi', 'info');
        await loadPosts(user);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  document.querySelectorAll('.report-post-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const postId = parseInt(btn.dataset.id, 10);
      const post = posts.find((p) => p.id === postId);
      openReportModal(document.getElementById('forum-modal'), {
        type: 'post',
        id: postId,
        name: post?.title || '',
        authorName: post?.author_name || '',
      });
    });
  });
}

async function loadCommentsForPosts(posts, user) {
  await Promise.all(
    posts.map(async (post) => {
      const container = document.getElementById(`forum-comments-${post.id}`);
      if (!container) return;
      try {
        const { comments } = await api.getForumComments(post.id);
        container.innerHTML = renderComments(post.id, comments, user);
        bindCommentEvents(post.id, user);
      } catch (err) {
        container.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
      }
    })
  );
}

function renderComments(postId, comments = [], user) {
  const commentHtml = comments
    .map(
      (comment) => `
        <div class="comment-item">
          <div class="comment-header">
            <strong>${escapeHtml(comment.author_name)}</strong>
            <span class="muted">${new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          <p>${escapeHtml(comment.body)}</p>
          ${
            user && comment.user_id === user.id
              ? `<button class="btn btn-ghost btn-sm delete-comment-btn" data-id="${comment.id}" data-post-id="${postId}">Sil</button>`
              : ''
          }
        </div>
      `
    )
    .join('');

  return `
    <div class="comment-list">
      <div class="comment-header-line">
        <span>Yorumlar (${comments.length})</span>
      </div>
      ${commentHtml || '<p class="muted">Henüz yorum yok.</p>'}
    </div>
    ${user ? `
      <form class="comment-form" data-post-id="${postId}">
        <textarea name="comment" placeholder="Yorum yazın..." required minlength="3"></textarea>
        <button type="submit" class="btn btn-primary btn-sm">Yorum Gönder</button>
      </form>
    ` : '<p class="muted">Yorum göndermek için giriş yapın.</p>'}
  `;
}

function bindCommentEvents(postId, user) {
  const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textarea = form.querySelector('textarea[name="comment"]');
      const body = textarea.value.trim();
      if (!body || body.length < 3) {
        showToast('Yorum en az 3 karakter olmalı', 'error');
        return;
      }
      try {
        await api.createForumComment(postId, body);
        showToast('Yorum gönderildi', 'success');
        textarea.value = '';
        await loadCommentsForPosts([{ id: postId }], user);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  document.querySelectorAll(`.delete-comment-btn[data-post-id="${postId}"]`).forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Yorumu silmek istediğine emin misin?')) return;
      try {
        await api.deleteForumComment(postId, parseInt(btn.dataset.id, 10));
        showToast('Yorum silindi', 'info');
        await loadCommentsForPosts([{ id: postId }], user);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

async function openPostModal(user, post = null, habits = null) {
  if (!habits) {
    const res = await api.getHabits();
    habits = res.habits || [];
  }

  const modal = document.getElementById('forum-modal');
  const isEdit = !!post;
  modal.classList.remove('hidden');

  modal.innerHTML = `
    <div class="modal-backdrop" id="forum-backdrop"></div>
    <div class="modal-content card">
      <h2>${isEdit ? 'İlanı Düzenle' : 'Yeni İlan'}</h2>
      <form id="post-form" class="form">
        <div class="form-group">
          <label for="post-title">Başlık</label>
          <input type="text" id="post-title" value="${post ? escapeHtml(post.title) : ''}" required minlength="3" />
        </div>
        <div class="form-group">
          <label for="post-body">İçerik</label>
          <textarea id="post-body" rows="4" required minlength="10">${post ? escapeHtml(post.body) : ''}</textarea>
        </div>
        ${
          !isEdit
            ? `<div class="form-group">
                <label for="post-habit">Alışkanlık</label>
                <select id="post-habit" required>
                  <option value="">Seçin</option>
                  ${habits
                    .map((h) => `<option value="${h.id}">${escapeHtml(h.name)}</option>`)
                    .join('')}
                </select>
              </div>`
            : ''
        }
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="cancel-post">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Kaydet' : 'Yayınla'}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('forum-backdrop').addEventListener('click', closeForumModal);
  document.getElementById('cancel-post').addEventListener('click', closeForumModal);

  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title').value.trim();
    const body = document.getElementById('post-body').value.trim();

    if (title.length < 3) {
      showToast('Başlık en az 3 karakter olmalı', 'error');
      return;
    }
    if (body.length < 10) {
      showToast('İçerik en az 10 karakter olmalı', 'error');
      return;
    }

    try {
      if (isEdit) {
        await api.updateForumPost(post.id, { title, body });
        showToast('İlan güncellendi', 'success');
      } else {
        const habitId = parseInt(document.getElementById('post-habit').value, 10);
        if (!habitId) {
          showToast('Alışkanlık seçin', 'error');
          return;
        }
        await api.createForumPost({ title, body, habit_id: habitId });
        showToast('İlan yayınlandı', 'success');
      }
      closeForumModal();
      await loadPosts(user);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function closeForumModal() {
  const modal = document.getElementById('forum-modal');
  modal.classList.add('hidden');
  modal.innerHTML = '';
}


