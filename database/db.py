import sqlite3
from datetime import datetime

DB_NAME = "finance.db"

def get_conn():
    return sqlite3.connect(DB_NAME, check_same_thread=False)

def init_db():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS expenses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        amount REAL,
        merchant TEXT,
        category TEXT,
        payment_mode TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS budgets(
        category TEXT PRIMARY KEY,
        monthly_limit REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS alerts(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        created_at TEXT
    )
    """)

    conn.commit()
    conn.close()