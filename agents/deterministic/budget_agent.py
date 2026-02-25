from database.db import get_conn

class BudgetAgent:

    def run(self, state):

        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            "SELECT SUM(amount) FROM expenses WHERE category=?",
            (state["category"],)
        )
        total = cur.fetchone()[0] or 0

        cur.execute(
            "SELECT monthly_limit FROM budgets WHERE category=?",
            (state["category"],)
        )
        row = cur.fetchone()
        conn.close()

        state["over_budget"] = bool(row and total > row[0])
        return state