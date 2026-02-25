from langchain_groq import ChatGroq
from utils.config import Settings

class GroqClient:

    def __init__(self):
        self.llm = ChatGroq(
            model_name=Settings.GROQ_MODEL,
            api_key=Settings.GROQ_API_KEY,
            temperature=0.2
        )

    def generate(self, prompt: str):
        res = self.llm.invoke(prompt)
        return res.content