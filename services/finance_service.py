from datetime import datetime
import pandas as pd

from graph.finance_graph import build_graph
from database.db import get_conn, init_db
from guardrails.input_guardrail import validate_text_input


class FinanceService:

    def __init__(self):
        init_db()
        self.graph = build_graph()

    def run_pipeline_from_text(self, text):

        ok, err = validate_text_input(text)
        if not ok:
            return {"ok": False, "error": err}

        state = {
            "raw_input": text,
            "alerts": [],
            "insights": []
        }

        result = self.graph.invoke(state)

        if result.get("error"):
            return {"ok": False, "error": result["error"]}

        self._save_expense(result)
        self._save_alerts(result.get("alerts", []))

        return {"ok": True, "advisor": result.get("advisor_response")}

    def _save_expense(self, data):

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
        INSERT INTO expenses(date, amount, merchant, category, payment_mode)
        VALUES(?,?,?,?,?)
        """, (
            datetime.now().isoformat(),
            data["amount"],
            data["merchant"],
            data["category"],
            data["payment_mode"]
        ))

        conn.commit()
        conn.close()

    def _save_alerts(self, alerts):

        conn = get_conn()
        cur = conn.cursor()

        for msg in alerts:
            cur.execute(
                "INSERT INTO alerts(message, created_at) VALUES(?,?)",
                (msg, datetime.now().isoformat())
            )

        conn.commit()
        conn.close()

    def get_monthly_total(self):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT SUM(amount) FROM expenses")
        total = cur.fetchone()[0] or 0
        conn.close()
        return total

    def get_category_summary(self):
        conn = get_conn()
        df = pd.read_sql_query(
            "SELECT category, SUM(amount) as total FROM expenses GROUP BY category",
            conn
        )
        conn.close()
        if df.empty:
            return {}
        return df.set_index("category")