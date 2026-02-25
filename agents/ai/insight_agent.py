from database.db import get_conn

class InsightAgent:

    def run(self, state):

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
        SELECT category, SUM(amount)
        FROM expenses
        GROUP BY category
        ORDER BY SUM(amount) DESC
        """)

        rows = cur.fetchall()
        conn.close()

        insights = []
        if rows:
            insights.append(f"Highest spending category is {rows[0][0]}")

        state["insights"] = insights
        return state