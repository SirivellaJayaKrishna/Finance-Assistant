import re

class ParserAgent:
    """
    Parses Indian bank / UPI / wallet SMS messages.
    Handles formats from HDFC, SBI, ICICI, Axis, Kotak, Paytm, PhonePe, GPay etc.
    """

    # ── Amount patterns ────────────────────────────────────────────────────────
    AMOUNT_PATTERNS = [
        r'(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)',   # INR 1,234.56 / Rs.500 / ₹299
        r'([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)',   # 1234.56 INR
        r'(?:debited|credited|spent|paid|charged)\D{0,10}([\d,]+(?:\.\d{1,2})?)',
        r'([\d,]+(?:\.\d{1,2})?)\s*(?:has been|is)\s*(?:debited|credited)',
    ]

    # ── Merchant patterns ──────────────────────────────────────────────────────
    MERCHANT_PATTERNS = [
        r'(?:to|at|for|@)\s+([A-Za-z0-9\s&\-_\.]{2,30}?)(?:\s+on|\s+via|\s+ref|\s+upi|\.|,|$)',
        r'(?:UPI[-\s])?(?:to)\s+([A-Za-z0-9\s&\-]{2,25})',
        r'(?:at)\s+([A-Za-z0-9\s&\-]{2,25}?)(?:\s+on|\s+dated|\.|,)',
        r'(?:merchant|store|vendor)[\s:]+([A-Za-z0-9\s&\-]{2,25})',
    ]

    # ── Payment mode patterns ──────────────────────────────────────────────────
    MODE_PATTERNS = {
        'UPI':         r'\b(?:UPI|upi|PhonePe|GPay|Google Pay|Paytm|BHIM)\b',
        'Credit Card': r'\b(?:credit card|CC|CREDIT CARD)\b',
        'Debit Card':  r'\b(?:debit card|DC|DEBIT CARD|ATM)\b',
        'Net Banking': r'\b(?:NEFT|RTGS|IMPS|net banking|netbanking)\b',
        'Wallet':      r'\b(?:wallet|Paytm wallet|Mobikwik|Freecharge)\b',
        'EMI':         r'\b(?:EMI|emi)\b',
    }

    # ── Transaction type ───────────────────────────────────────────────────────
    DEBIT_KEYWORDS  = r'\b(?:debited|debit|spent|paid|payment|purchase|withdrawn|sent|transferred out)\b'
    CREDIT_KEYWORDS = r'\b(?:credited|credit|received|salary|refund|cashback|deposited|transferred in)\b'

    # ── Known merchant → clean name map ───────────────────────────────────────
    MERCHANT_MAP = {
        'swiggy':     'Swiggy',   'zomato':  'Zomato',    'blinkit':   'Blinkit',
        'zepto':      'Zepto',    'uber':    'Uber',       'ola':       'Ola',
        'rapido':     'Rapido',   'amazon':  'Amazon',     'flipkart':  'Flipkart',
        'myntra':     'Myntra',   'ajio':    'Ajio',       'netflix':   'Netflix',
        'spotify':    'Spotify',  'hotstar': 'Hotstar',    'youtube':   'YouTube Premium',
        'airtel':     'Airtel',   'jio':     'Jio',        'bsnl':      'BSNL',
        'electricity':'Electricity Board',   'bescom':    'BESCOM',
        'bbmp':       'BBMP',     'irctc':   'IRCTC',      'makemytrip':'MakeMyTrip',
        'goibibo':    'Goibibo',  'oyo':     'OYO',        'pharmeasy': 'PharmEasy',
        '1mg':        '1mg',      'apollo':  'Apollo Pharmacy',
        'bigbasket':  'BigBasket','dmart':   'DMart',      'reliance':  'Reliance Smart',
        'gpay':       'Google Pay','phonepe': 'PhonePe',   'paytm':     'Paytm',
    }

    def run(self, state: dict) -> dict:
        text = state.get('raw_input', '')

        amount = self._extract_amount(text)
        if amount is None:
            state['error'] = 'Could not detect transaction amount. Please check the SMS format.'
            return state

        merchant       = self._extract_merchant(text)
        payment_mode   = self._extract_payment_mode(text)
        tx_type        = self._extract_tx_type(text)

        state['amount']       = amount
        state['merchant']     = merchant
        state['payment_mode'] = payment_mode
        state['tx_type']      = tx_type          # 'debit' | 'credit' | 'unknown'

        return state

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _extract_amount(self, text: str):
        for pattern in self.AMOUNT_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                raw = m.group(1).replace(',', '')
                try:
                    return float(raw)
                except ValueError:
                    continue
        return None

    def _extract_merchant(self, text: str) -> str:
        # 1. Check known merchants first (most reliable)
        lower = text.lower()
        for key, name in self.MERCHANT_MAP.items():
            if key in lower:
                return name

        # 2. Try regex patterns
        for pattern in self.MERCHANT_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                merchant = m.group(1).strip().rstrip('.,')
                # Skip bank names and noise words
                noise = {'hdfc', 'sbi', 'icici', 'axis', 'kotak', 'bank', 'your', 'ac', 'a/c', 'acct'}
                if merchant.lower() not in noise and len(merchant) > 1:
                    return merchant.title()

        return 'Unknown Merchant'

    def _extract_payment_mode(self, text: str) -> str:
        for mode, pattern in self.MODE_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                return mode
        # Default: if account number mentioned → likely card/bank
        if re.search(r'(?:A/c|AC|acct|account)\s*(?:no\.?)?\s*[Xx\d]{4,}', text, re.IGNORECASE):
            return 'Bank Transfer'
        return 'UPI'   # most common in India

    def _extract_tx_type(self, text: str) -> str:
        if re.search(self.DEBIT_KEYWORDS,  text, re.IGNORECASE): return 'debit'
        if re.search(self.CREDIT_KEYWORDS, text, re.IGNORECASE): return 'credit'
        return 'unknown'