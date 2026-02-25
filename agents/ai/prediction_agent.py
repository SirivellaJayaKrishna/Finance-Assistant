from database.db import get_conn

class PredictionAgent:

    def run(self, state):

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT AVG(amount) FROM expenses")
        avg = cur.fetchone()[0] or 0
        conn.close()

        state["prediction"] = f"Next expense may be around {round(avg,2)}"
        return state