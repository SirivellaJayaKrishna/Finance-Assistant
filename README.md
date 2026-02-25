# FinTrack — AI Personal Finance Assistant

> An intelligent personal finance tracker powered by **LangGraph**, **Groq LLM**, and a modern **React + FastAPI** stack. Parse bank SMS messages, auto-categorise expenses, get AI-powered budgeting advice, and visualise your spending — all in a beautiful dark dashboard.

![Tech Stack](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent_Pipeline-purple?style=flat-square)
![Groq](https://img.shields.io/badge/Groq-LLaMA3_70B-orange?style=flat-square)

---

## ✨ Features

- 📲 **SMS Parser** — paste any bank/UPI SMS and extract amount, merchant, payment mode automatically
- 🏷️ **Auto Categorisation** — maps merchants to spending categories (Food, Transport, Shopping, etc.)
- 📊 **Budget Tracking** — set monthly limits per category, get alerted when you exceed them
- 🤖 **AI Advisor** — Groq LLaMA3-powered budgeting advice on every transaction
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
| `ParserAgent` | Deterministic | Extracts amount, merchant, payment mode from SMS |
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
│
├── agents/
│   ├── deterministic/
│   │   ├── parser_agent.py       # SMS parsing
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
        ├── App.jsx               # Main UI component
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

### 2. Set up environment

```bash
# Create virtual environment
python -m venv assistant
source assistant/bin/activate  # Windows: assistant\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
pip install fastapi "uvicorn[standard]"
```

### 3. Configure API key

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
```

Get your free API key at: https://console.groq.com

### 4. Start the backend

```bash
# From project root
uvicorn api:app --port 8000 &
```

API docs available at: http://localhost:8000/docs

### 5. Start the frontend

```bash
cd ui
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

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

### Example: Process an SMS

```bash
curl -X POST http://localhost:8000/process-sms \
  -H "Content-Type: application/json" \
  -d '{"sms": "INR 349.00 debited from A/c XX4521 via UPI to Zomato on 24-02-25"}'
```

Response:
```json
{
  "ok": true,
  "advisor": "You've been spending frequently on Food. Consider setting a weekly limit to stay within your monthly budget."
}
```

---

## 🖥️ UI Overview

| Tab | Description |
|-----|-------------|
| **Dashboard** | Animated spend metrics, transaction list, interactive donut chart |
| **Add Expense** | SMS input with live LangGraph pipeline visualiser |
| **Budgets** | Set per-category limits, view spend vs limit progress bars |
| **Alerts** | All AlertAgent warnings in chronological order |

---

## 🛠️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API
- [LangGraph](https://github.com/langchain-ai/langgraph) — Agent pipeline orchestration
- [LangChain Groq](https://python.langchain.com/docs/integrations/chat/groq) — LLM integration
- [SQLite](https://sqlite.org/) — Local database
- [Pydantic](https://docs.pydantic.dev/) — Data validation

**Frontend**
- [React 18](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — Build tool
- Vanilla CSS with CSS variables — No UI library, fully custom

**AI**
- [Groq](https://groq.com/) — Inference (LLaMA3 70B)

---

## 📦 Production Build

Serve everything from a single FastAPI server:

```bash
# Build the React app
cd ui && npm run build

# Install static file support
pip install aiofiles
```

Add to `api.py`:
```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="static")
```

Now run:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

---

## 🔮 Roadmap

- [ ] User authentication (JWT)
- [ ] PostgreSQL support
- [ ] Deploy to Railway / Render
- [ ] Better SMS parsing with LLM
- [ ] Monthly reports (PDF export)
- [ ] Mobile responsive improvements
- [ ] Multi-user support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use this for personal or commercial projects.

---

## 👤 Author

**Jayakrishna Sirivella**  
GitHub: [@jayakrishnasirivella](https://github.com/jayakrishnasirivella)
