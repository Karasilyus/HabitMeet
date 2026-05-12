# 🏃 HabitMeet

> Alışkanlıklarını takip et, aynı semtteki insanlarla buluş.

HabitMeet; kullanıcıların günlük alışkanlıklarını kayıt altına alıp takip edebildiği, belirli bir süre aynı alışkanlığı düzenli sürdüren ve aynı semtte yaşayan kullanıcıları otomatik olarak eşleştiren, eşleşen kullanıcıların forum üzerinden etkinlik ilanı paylaşabildiği, birbirini aktiviteye davet edebildiği ve asenkron mesajlaşabildiği bir web uygulamasıdır.

---

## 📌 Özellikler

- 🔐 **JWT tabanlı kimlik doğrulama** — Kayıt ol, giriş yap, güvenli oturumlar
- ✅ **Alışkanlık CRUD** — Alışkanlık oluştur, güncelle, sil, listele
- 📅 **Günlük log takibi** — Her gün alışkanlığını işaretle, streak'ini koru
- 🤝 **Otomatik eşleşme** — Aynı semt + aynı alışkanlık + yeterli streak = eşleşme
- 📢 **Forum / Etkinlik ilanları** — İlan yayınla, başkalarını aktiviteye davet et
- 💬 **Asenkron mesajlaşma** — Eşleştiğin kişilerle mesajlaş (uygulamaya girince görürsün)

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Vanilla JavaScript (SPA) |
| Backend | Node.js + Express |
| Veritabanı | PostgreSQL |
| Kimlik Doğrulama | JWT (Access Token) |
| API Dokümantasyonu | Swagger / OpenAPI |
| Test | Jest |
| Versiyon Kontrolü | Git + GitHub |

---

## 🗃️ Veri Modeli

```
User        → id, name, email, password, neighborhood, createdAt
Habit       → id, userId, name, category, createdAt
HabitLog    → id, habitId, date, completed
Match       → id, userId1, userId2, habitId, createdAt
ForumPost   → id, userId, habitId, title, body, createdAt
Message     → id, matchId, senderId, body, createdAt, isRead
```

---

## 🚧 Geliştirme Aşamasında

Kurulum adımları, API dokümantasyonu ve test bilgileri proje tamamlandıkça güncellenecektir.

---

## 📅 Proje Bilgisi

- **Ders:** Sistem Analizi ve Tasarımı — Bahar 2026
- **Üniversite:** İstanbul Arel Üniversitesi
- **Geliştirici:** Mustafa Aydın Efe
- **GitHub:** [Karasilyus](https://github.com/Karasilyus)
