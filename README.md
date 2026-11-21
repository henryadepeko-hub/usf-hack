# 🏠 RoomSwipe

> **Tinder for roommates, except it learns your real dealbreakers from how you swipe.**

Roommate surveys get dishonest answers. Everyone says "I'm clean" and "guests are fine," and the truth comes out after the lease is signed. RoomSwipe replaces the survey with **dynamic swiping** on real-life scenario cards and roommate profiles: every swipe teaches the app what you actually care about, and the deck adapts live.

---

## ✨ Key Features

- **4-direction dynamic swiping**
  - ➡️ **Right:** I'm fine with this / interested
  - ⬅️ **Left:** not okay / pass
  - ⬆️ **Up:** **dealbreaker** (this really matters to me)
  - ⬇️ **Down:** don't care
- **Live re-ranking.** Every swipe updates your trait values and preference weights, and the deck re-sorts instantly.
- **Automatic dealbreaker filtering.** Profiles that conflict with your dealbreakers disappear from your deck.
- **Smart questions.** Scenario cards target the traits the app is least sure about.
- **Real-time vibe radar chart + learning toasts** ("Got it, quiet nights are a must 🌙").
- **Gemini match breakdown.** Strengths, one friction point with a suggested compromise, and an icebreaker.
- **One-click roommate agreement.** Gemini writes a fair agreement covering quiet hours, guests, chores, kitchen and bills.

---

## 🧠 How It Works

1. Swipe a mixed deck of **scenarios** ("Friends over at 2am on a Tuesday") and **profiles**.
2. Each swipe updates your profile across 6 traits: `sleep`, `clean`, `guests`, `noise`, `study`, `budget`.
3. Compatibility = `Σ weight × (1 − |you − them|)`, filtered by dealbreakers and re-ranked after every swipe.
4. Mutual match → Gemini explains why you click and drafts your roommate agreement.

---

## 🛠 Tech Stack

| Layer | Tools |
|---|---|
| Framework | Next.js (App Router, JavaScript) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Markdown | React Markdown |
| AI | Google Gemini API (`@google/genai`) |
| Hosting | Vercel |

---

## 📁 Project Structure

```
roomswipe/
├── app/
│   ├── page.jsx              # Main swipe screen
│   └── api/
│       ├── explain/route.js  # Gemini match breakdown
│       └── agreement/route.js# Gemini roommate agreement
├── components/
│   ├── SwipeDeck.jsx         # 4-direction swipe deck
│   ├── ProfileCard.jsx
│   ├── ScenarioCard.jsx
│   ├── MatchModal.jsx
│   ├── VibeChart.jsx         # Live trait radar chart
│   └── AgreementView.jsx
├── lib/
│   └── matching.js           # Learning, scoring, deck ranking
└── data/
    ├── profiles.json         # Fictional demo profiles
    └── scenarios.json        # Scenario cards
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone <your-repo-url>
cd roomswipe
npm install
```

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Tip:** To test on your phone, run `npm run dev -- -H 0.0.0.0` and open `http://<your-laptop-ip>:3000` on the same Wi-Fi.

---

## 🛡 Fairness & Privacy

- Matching uses **lifestyle traits only** (sleep, cleanliness, guests, noise, study habits, budget).
- **No protected characteristics** (race, religion, ethnicity, sexual orientation, etc.) are collected, used or inferred, by our code or by Gemini.
- All demo profiles are **fictional** and use **illustrated avatars**, not photos of real people.
- The Gemini API key stays on the server and is never exposed to the browser.

---

## 🔮 What's Next

- 🔐 Authentication with **verified student emails** (`@usf.edu`)
- 🗄 Persistent database for profiles, swipes and matches
- 💬 Real-time chat with Gemini-suggested icebreakers
- 👥 Group matching for 3–4 person apartments
- 🏢 Partnership with campus housing + nearby apartment listings
- 📈 Post-move-in feedback to improve matching over time

---

## 👥 Team

Built in 6 hours at a hackathon at **USF** by:

- **Alex:** Front end and swipe UI
- **Bri:** Matching engine
- **Cam:** Gemini integration and pitch
