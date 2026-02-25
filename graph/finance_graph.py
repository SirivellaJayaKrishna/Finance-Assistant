from langgraph.graph import StateGraph, END
from graph.state import FinanceState
from graph.role_router import route_after_alert

from agents.deterministic.parser_agent import ParserAgent
from agents.deterministic.category_agent import CategoryAgent
from agents.deterministic.budget_agent import BudgetAgent
from agents.deterministic.alert_agent import AlertAgent

from agents.ai.insight_agent import InsightAgent
from agents.ai.prediction_agent import PredictionAgent
from agents.ai.advisor_agent import AdvisorAgent


parser = ParserAgent()
category = CategoryAgent()
budget = BudgetAgent()
alert = AlertAgent()

insight = InsightAgent()
prediction = PredictionAgent()
advisor = AdvisorAgent()


def build_graph():

    builder = StateGraph(FinanceState)

    builder.add_node("parser", parser.run)
    builder.add_node("category", category.run)
    builder.add_node("budget", budget.run)
    builder.add_node("alert", alert.run)
    builder.add_node("insight", insight.run)
    builder.add_node("prediction", prediction.run)
    builder.add_node("advisor", advisor.run)

    builder.set_entry_point("parser")

    builder.add_edge("parser", "category")
    builder.add_edge("category", "budget")
    builder.add_edge("budget", "alert")

    builder.add_conditional_edges(
        "alert",
        route_after_alert,
        {
            "advisor": "advisor",
            "insight": "insight"
        }
    )

    builder.add_edge("advisor", "prediction")
    builder.add_edge("insight", "prediction")
    builder.add_edge("prediction", END)

    return builder.compile()