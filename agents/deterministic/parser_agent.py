import re

class ParserAgent:

    def run(self, state):

        text = state["raw_input"]

        amount_match = re.search(r'(\d+)', text)
        merchant_match = re.search(r'at\s([A-Za-z]+)', text)

        if not amount_match:
            state["error"] = "Amount not detected"
            return state

        state["amount"] = float(amount_match.group(1))
        state["merchant"] = merchant_match.group(1) if merchant_match else "Unknown"
        state["payment_mode"] = "card"
        return state