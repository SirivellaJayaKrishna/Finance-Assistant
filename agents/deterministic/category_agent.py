MAP = {
    "Swiggy": "Food",
    "Zomato": "Food",
    "Uber": "Transport",
    "Amazon": "Shopping"
}

class CategoryAgent:

    def run(self, state):
        state["category"] = MAP.get(state["merchant"], "Others")
        return state