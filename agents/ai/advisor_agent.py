from llm.groq_client import GroqClient

class AdvisorAgent:

    def __init__(self):
        self.client = GroqClient()

    def run(self, state):

        prompt = f"""
You are a safe financial assistant.

Spending category: {state.get("category")}
Alerts: {state.get("alerts")}
Insights: {state.get("insights")}

Give short budgeting advice.
"""

        state["advisor_response"] = self.client.generate(prompt)
        return state