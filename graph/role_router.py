def route_after_alert(state):

    # simple intelligent routing logic
    if state.get("over_budget"):
        return "advisor"

    return "insight"