# import streamlit as st
# from services.finance_service import FinanceService

# service = FinanceService()

# st.set_page_config(layout="wide")

# st.title("AI Personal Finance Assistant")

# tab1, tab2 = st.tabs(["Dashboard", "Add Expense"])

# with tab1:

#     st.metric("Total Expenses", service.get_monthly_total())
#     st.bar_chart(service.get_category_summary())

# with tab2:

#     sms = st.text_area("Paste SMS")

#     if st.button("Process"):

#         res = service.run_pipeline_from_text(sms)

#         if res["ok"]:
#             st.success("Expense Added")

#             if res.get("advisor"):
#                 st.info(res["advisor"])
#         else:
#             st.error(res["error"])

