# FinTrack — AI Personal Finance Assistant

> An intelligent personal finance tracker powered by **LangGraph**, **Groq LLM**, and a modern **React + FastAPI** stack. Parse bank SMS messages, auto-categorise expenses, get AI-powered budgeting advice, and visualise your spending — all in a beautiful dark dashboard.

![Tech Stack](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent_Pipeline-purple?style=flat-square)
![Groq](https://img.shields.io/badge/Groq-LLaMA3_70B-orange?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightblue?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
> Animated spend metrics, interactive donut chart, and recent transactions

### Add Expense — SMS Parser
![SMS Parser](screenshots/sms_parser.png)
> Paste any bank SMS — the live pipeline visualiser shows each agent processing in real time

### Budget Manager
![Budgets](screenshots/budgets.png)
> Set monthly limits per category with live spend vs limit progress bars

### Alerts
![Alerts](screenshots/alerts.png)
> All AlertAgent warnings when budgets are exceeded

---
## 🎥 Demo

https://github.com/user-attachments/assets/40355ce1-5c74-4ad6-b29a-1876d61bc174

## ✨ Features

- 📲 **SMS Parser** — paste any Indian bank/UPI SMS (HDFC, SBI, ICICI, Axis, Kotak, Paytm, PhonePe, GPay) and extract amount, merchant, payment mode automatically
- 🏷️ **Auto Categorisation** — maps 30+ merchants to spending categories (Food, Transport, Shopping, etc.)
- 📊 **Budget Tracking** — set monthly limits per category, get alerted when you exceed them
- 🤖 **AI Advisor** — Groq LLaMA3-powered personalised budgeting advice on every transaction
- 💡 **Insights & Predictions** — spending patterns and next-expense forecasts
- 🔔 **Alerts** — real-time warnings when budgets are breached
- 🎨 **Modern UI** — dark dashboard with animated charts, donut graphs, and live pipeline visualiser

---

## 🧠 Architecture

```
SMS Text Input
      │
      ▼
┌─────────────────────────────────────────────┐
│              LangGraph Pipeline             │
│                                             │
│  Parser → Category → Budget → Alert        │
│                  ↓              ↓           │
│             Insight          Advisor (AI)   │
│                  └──────┬───────┘           │
│                      Prediction             │
└─────────────────────────────────────────────┘
      │
      ▼
  SQLite DB  ←→  FastAPI  ←→  React UI
```

### Agent Breakdown

| Agent | Type | Role |
|-------|------|------|
| `ParserAgent` | Deterministic | Extracts amount, merchant, payment mode from SMS (30+ bank formats) |
| `CategoryAgent` | Deterministic | Maps merchant → category |
| `BudgetAgent` | Deterministic | Checks monthly spend vs limits |
| `AlertAgent` | Deterministic | Generates budget breach warnings |
| `InsightAgent` | Deterministic | Analyses historical spending patterns |
| `PredictionAgent` | Deterministic | Forecasts next expense amount |
| `AdvisorAgent` | AI (Groq LLM) | Generates personalised budgeting advice |

---

## 🗂️ Project Structure

```
Finance_Assistant/
├── api.py                        # FastAPI server
├── app.py                        # Legacy Streamlit UI (replaced)
├── main.py                       # DB initialiser
├── finance.db                    # SQLite database
├── .env                          # API keys (not committed)
├── .env.example                  # Environment variable template
├── requirements.txt              # Python dependencies
│
├── agents/
│   ├── deterministic/
│   │   ├── parser_agent.py       # SMS parsing (30+ bank formats)
│   │   ├── category_agent.py     # Merchant categorisation
│   │   ├── budget_agent.py       # Budget limit checking
│   │   └── alert_agent.py        # Alert generation
│   └── ai/
│       ├── advisor_agent.py      # Groq LLM advisor
│       ├── insight_agent.py      # Spending insights
│       └── prediction_agent.py   # Expense prediction
│
├── graph/
│   ├── finance_graph.py          # LangGraph pipeline builder
│   ├── role_router.py            # Conditional routing logic
│   └── state.py                  # Shared state TypedDict
│
├── services/
│   └── finance_service.py        # Main service layer
│
├── database/
│   └── db.py                     # SQLite connection & schema
│
├── guardrails/
│   └── input_guardrail.py        # Input validation
│
├── llm/
│   └── groq_client.py            # Groq API client
│
├── utils/
│   └── config.py                 # Environment config
│
└── ui/                           # React frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Main UI (Dashboard, SMS, Budgets, Alerts)
        ├── api.js                # API client
        ├── index.css             # Global styles
        └── main.jsx              # React entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/jayakrishnasirivella/Finance-Assistant.git
cd Finance-Assistant
```

### 2. Set up Python environment

```bash
python -m venv assistant
source assistant/bin/activate       # Windows: assistant\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure API keys

```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
```

Get your free key at: https://console.groq.com

### 4. Run both servers

**Terminal 1 — Backend:**
```bash
uvicorn api:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd ui
npm install
npm run dev
```

Open **http://localhost:5173** 🚀

---

## 📲 Supported SMS Formats

The improved parser handles 30+ Indian bank formats:

```
# HDFC
INR 349.00 debited from A/c XX4521 via UPI to Zomato on 24-02-25.

# SBI
Your A/c XX7890 debited Rs.1,299 for Amazon on 23-Feb-25.

# ICICI
Rs.125 debited from AC XX1234 at Uber on 24-Feb. Bal:Rs.9,875.

# Axis
Rs.500.00 spent on your Axis Bank Card at Swiggy on 24-Feb-2025.

# PhonePe / GPay
Rs.349 paid to Zomato via PhonePe. UPI Ref: 123456789.

# Salary credit
Acct XX2201 Cr. Rs.85,000.00 on 20-Feb-25. Salary from EMPLOYER.
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check |
| `GET` | `/summary` | Monthly total + category breakdown |
| `GET` | `/stats` | Transaction count, averages, alert count |
| `GET` | `/transactions` | Recent expenses |
| `GET` | `/alerts` | Budget breach alerts |
| `GET` | `/budgets` | Category budget limits |
| `POST` | `/budgets` | Set/update a category budget |
| `POST` | `/process-sms` | Run full AI pipeline on SMS text |

Full interactive docs at: **http://localhost:8000/docs**

### Example

```bash
curl -X POST http://localhost:8000/process-sms \
  -H "Content-Type: application/json" \
  -d '{"sms": "INR 349.00 debited from A/c XX4521 via UPI to Zomato on 24-02-25"}'
```

```json
{
  "ok": true,
  "advisor": "You've been spending frequently on Food. Consider meal prepping to save money this month."
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | FastAPI, Uvicorn |
| AI Pipeline | LangGraph, LangChain |
| LLM | Groq (LLaMA3 70B) |
| Database | SQLite |
| Validation | Pydantic |

---

## 📦 Production Build

```bash
cd ui && npm run build
pip install aiofiles
```

Add to `api.py`:
```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="static")
```

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

---

## 🔮 Roadmap

- [ ] User authentication (JWT)
- [ ] PostgreSQL support
- [ ] Deploy to Railway / Render
- [ ] Monthly PDF reports
- [ ] Mobile responsive improvements
- [ ] Multi-user support
- [ ] WhatsApp SMS auto-import

---

## 📄 License

MIT License — free to use for personal or commercial projects.

---

## 👤 Author

**Jayakrishna Sirivella**
GitHub: [@jayakrishnasirivella](https://github.com/jayakrishnasirivella)

---

⭐ **If you found this useful, please star the repo!**
