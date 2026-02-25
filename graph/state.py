from typing import TypedDict, List, Optional

class FinanceState(TypedDict):

    raw_input: str
    amount: float
    merchant: str
    category: str
    payment_mode: str
    over_budget: bool

    alerts: List[str]
    insights: List[str]
    prediction: Optional[str]
    advisor_response: Optional[str]

    error: Optional[str]