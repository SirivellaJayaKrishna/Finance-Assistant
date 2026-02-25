class AlertAgent:

    def run(self, state):

        alerts = []

        if state.get("over_budget"):
            alerts.append(f"You exceeded budget for {state['category']}")

        state["alerts"] = alerts
        return state