import { Expense, ExpenseCategory } from '../types/expense';

export interface ScanProgress {
  phase: 'idle' | 'authenticating' | 'fetching_list' | 'parsing_messages' | 'complete' | 'error';
  currentCount: number;
  totalCount: number;
  statusText: string;
  foundExpenses: Expense[];
}

// Category keyword mappings for automated classification
const CATEGORY_RULES: { category: ExpenseCategory; keywords: string[] }[] = [
  {
    category: 'Food & Dining',
    keywords: [
      'swiggy', 'zomato', 'starbucks', 'mcdonald', 'domino', 'pizza', 'burger', 'kfc',
      'cafe', 'restaurant', 'dining', 'bakery', 'eats', 'diner', 'subway', 'barbeque'
    ],
  },
  {
    category: 'Groceries',
    keywords: [
      'blinkit', 'zepto', 'bigbasket', 'instamart', 'grofers', 'grocery', 'supermarket',
      'dmart', 'reliance fresh', 'spencer', 'vegetables', 'fruits', 'kirana'
    ],
  },
  {
    category: 'Shopping & Retail',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'zara', 'h&m', 'tata cliq',
      'retail', 'shopping', 'store', 'apparel', 'fashion', 'electronics', 'clothing',
      'decathlon', 'uniqlo', 'croma', 'reliance digital'
    ],
  },
  {
    category: 'Travel & Transport',
    keywords: [
      'uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'cleartrip', 'goibibo', 'indigo',
      'air india', 'spicejet', 'vistara', 'flight', 'railway', 'train', 'metro', 'toll',
      'fastag', 'fuel', 'petrol', 'diesel', 'shell', 'hpcl', 'bpcl', 'iocl', 'cab', 'taxi'
    ],
  },
  {
    category: 'Bills & Utilities',
    keywords: [
      'electricity', 'bescom', 'tata power', 'adani', 'water bill', 'gas bill',
      'airtel', 'jio', 'vi', 'vodafone', 'broadband', 'wifi', 'recharge', 'utility',
      'postpaid', 'prepaid', 'bill desk', 'bbps', 'maintenance'
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      'netflix', 'spotify', 'prime video', 'hotstar', 'disney', 'bookmyshow', 'pvr',
      'inox', 'cinema', 'movie', 'youtube', 'apple music', 'steam', 'playstation', 'gaming'
    ],
  },
  {
    category: 'Health & Medical',
    keywords: [
      'apollo', '1mg', 'pharmeasy', 'netmeds', 'practo', 'pharmacy', 'hospital',
      'clinic', 'medical', 'diagnostic', 'pathology', 'medicine', 'dental', 'doctor'
    ],
  },
  {
    category: 'Business & Sales',
    keywords: [
      'vendor', 'supplier', 'scraft', 'raviraja', 'invoice', 'client', 'courier',
      'logistics', 'shipment', 'bluedart', 'delhivery', 'freight', 'raw material'
    ],
  },
  {
    category: 'Transfers & Investments',
    keywords: [
      'zerodha', 'groww', 'kuvera', 'angelone', 'upstox', 'mutual fund', 'sip',
      'investment', 'neft', 'rtgs', 'imps to', 'transfer to', 'fixed deposit'
    ],
  },
];

export class GmailScannerService {
  /**
   * Search and parse expense emails from Gmail
   */
  public static async scanExpenses(
    accessToken: string,
    options: {
      maxResults?: number;
      queryDays?: number;
      existingIds?: Set<string>;
      onProgress?: (progress: ScanProgress) => void;
    } = {}
  ): Promise<Expense[]> {
    const maxResults = options.maxResults || 25;
    const queryDays = options.queryDays || 30;
    const existingIds = options.existingIds || new Set<string>();

    const updateProgress = (
      phase: ScanProgress['phase'],
      current: number,
      total: number,
      statusText: string,
      found: Expense[]
    ) => {
      if (options.onProgress) {
        options.onProgress({
          phase,
          currentCount: current,
          totalCount: total,
          statusText,
          foundExpenses: found,
        });
      }
    };

    updateProgress('fetching_list', 0, 0, 'Searching for expense and transaction emails in your Gmail...', []);

    // Query for transactional keywords across banking, cards, UPI, digital receipts
    const searchQuery = [
      'newer_than:' + queryDays + 'd',
      '(debited OR credited OR spent OR paid OR purchase OR receipt OR invoice OR order OR "statement" OR "card ending" OR "UPI" OR "Rs." OR "INR")',
    ].join(' ');

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      searchQuery
    )}&maxResults=${maxResults}`;

    const listRes = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listRes.ok) {
      const errBody = await listRes.text();
      console.error('Gmail API list error:', listRes.status, errBody);
      if (listRes.status === 401) {
        throw new Error('Your Gmail session has expired. Please sign in again.');
      }
      throw new Error(`Gmail API error (${listRes.status}): ${errBody || 'Unable to fetch emails'}`);
    }

    const listData = await listRes.json();
    const messages: { id: string; threadId: string }[] = listData.messages || [];

    if (messages.length === 0) {
      updateProgress('complete', 0, 0, 'No recent transaction emails found in the selected period.', []);
      return [];
    }

    // Filter out messages we've already parsed
    const toFetch = messages.filter((m) => !existingIds.has(m.id));
    const totalToFetch = Math.min(toFetch.length, maxResults);

    updateProgress(
      'parsing_messages',
      0,
      totalToFetch,
      `Found ${messages.length} email records. Parsing ${totalToFetch} new messages...`,
      []
    );

    const extractedExpenses: Expense[] = [];

    // Fetch and process messages in controlled parallel batches
    const batchSize = 5;
    for (let i = 0; i < totalToFetch; i += batchSize) {
      const chunk = toFetch.slice(i, i + batchSize);
      const results = await Promise.all(
        chunk.map((item) => this.fetchAndParseMessage(accessToken, item.id))
      );

      for (const res of results) {
        if (res) {
          extractedExpenses.push(res);
        }
      }

      updateProgress(
        'parsing_messages',
        Math.min(i + batchSize, totalToFetch),
        totalToFetch,
        `Analyzing transactions: ${extractedExpenses.length} detected so far...`,
        [...extractedExpenses]
      );
    }

    updateProgress(
      'complete',
      totalToFetch,
      totalToFetch,
      `Scan complete! Detected ${extractedExpenses.length} expense transactions.`,
      extractedExpenses
    );

    return extractedExpenses;
  }

  /**
   * Fetch single message details and extract expense info
   */
  private static async fetchAndParseMessage(
    accessToken: string,
    messageId: string
  ): Promise<Expense | null> {
    try {
      const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
      const res = await fetch(msgUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) return null;
      const data = await res.json();

      const headers = data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const subject = getHeader('Subject');
      const from = getHeader('From');
      const dateHeader = getHeader('Date');
      const snippet = data.snippet || '';

      // Get body text from payload
      let bodyText = snippet;
      if (data.payload?.body?.data) {
        bodyText += ' ' + this.decodeBase64Url(data.payload.body.data);
      }
      if (data.payload?.parts) {
        for (const part of data.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText += ' ' + this.decodeBase64Url(part.body.data);
          }
        }
      }

      // Check if it's an expense transaction
      const fullText = `${subject} ${snippet} ${bodyText}`.toLowerCase();

      // Check if it's purely a promotional email with no actual monetary charge
      if (
        fullText.includes('offer inside') ||
        fullText.includes('discount on your next') ||
        fullText.includes('sale is live') ||
        fullText.includes('win a prize') ||
        fullText.includes('cashback offer')
      ) {
        // Only accept if explicitly has debit or payment confirmed indicators
        const hasDebitFlag =
          fullText.includes('debited') ||
          fullText.includes('paid to') ||
          fullText.includes('order confirmed') ||
          fullText.includes('invoice');
        if (!hasDebitFlag) {
          return null;
        }
      }

      // Extract amount
      const extractedAmount = this.extractAmount(subject, snippet, bodyText);
      if (!extractedAmount || extractedAmount <= 0) {
        return null; // No clear expense amount identified
      }

      // Extract merchant or payee name
      const merchant = this.extractMerchant(from, subject, snippet);

      // Determine Category
      const category = this.categorizeText(`${subject} ${merchant} ${snippet}`);

      // Determine Payment Method
      const paymentMethod = this.detectPaymentMethod(fullText);

      // Format ISO Date (YYYY-MM-DD)
      const parsedDate = this.parseDate(dateHeader);

      const expense: Expense = {
        id: `gmail-${messageId}`,
        title: merchant || subject.slice(0, 45) || 'Online Transaction',
        amount: extractedAmount,
        currency: 'INR', // Default to INR based on user region, can be USD/EUR
        category,
        date: parsedDate,
        paymentMethod,
        merchant,
        notes: subject.slice(0, 100),
        status: 'auto_detected',
        emailSource: {
          messageId,
          sender: from,
          subject,
          date: dateHeader,
          snippet: snippet.slice(0, 200),
        },
        createdAt: Date.now(),
      };

      return expense;
    } catch (e) {
      console.warn(`Error parsing message ${messageId}:`, e);
      return null;
    }
  }

  /**
   * Helper to decode Base64Url string from Gmail API
   */
  private static decodeBase64Url(base64Url: string): string {
    try {
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return '';
    }
  }

  /**
   * Extract financial amount from text using high-confidence regex patterns
   */
  public static extractAmount(subject: string, snippet: string, body: string): number | null {
    const combined = `${subject} . ${snippet} . ${body}`;

    // Patterns matching INR / Rs / ₹ / USD / $
    const patterns = [
      // e.g. "debited by INR 1,450.00" or "spent INR 2,500"
      /(?:debited|spent|paid|charged|amount of|total|sum of|txn of)\s*(?:by|for|is|:)?\s*(?:Rs\.?|INR|₹|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      // e.g. "Rs. 1,450.00 debited"
      /(?:Rs\.?|INR|₹|\$|€|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:debited|spent|paid|withdrawn|charged)/i,
      // e.g. "₹ 450.00" or "Rs. 1299"
      /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      // e.g. "$ 45.99"
      /(?:\$|USD)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      // Fallback: "Total: 500.00"
      /(?:total|grand total|amount due|paid)\s*[:=-]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    ];

    for (const pattern of patterns) {
      const match = combined.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].replace(/,/g, '');
        const val = parseFloat(cleaned);
        // Sanity checks: reject zero, invalid, or implausibly massive OTP-like numbers unless formatted
        if (!isNaN(val) && val > 0 && val < 5000000) {
          // Reject 6-digit integers with no decimals that look like OTPs or pincodes (e.g., 560001, 894512)
          if (val > 100000 && Number.isInteger(val) && !match[0].includes('.') && !match[0].includes(',')) {
            continue;
          }
          return Math.round(val * 100) / 100;
        }
      }
    }

    return null;
  }

  /**
   * Extract clean merchant/entity name
   */
  public static extractMerchant(fromHeader: string, subject: string, snippet: string): string {
    const combined = `${fromHeader} ${subject} ${snippet}`;

    // Common recognized vendors
    const vendorPatterns: { [key: string]: RegExp } = {
      'Swiggy': /swiggy/i,
      'Zomato': /zomato/i,
      'Uber': /uber/i,
      'Ola Cabs': /\b(ola)\b/i,
      'Amazon': /amazon/i,
      'Flipkart': /flipkart/i,
      'Blinkit': /blinkit/i,
      'Zepto': /zepto/i,
      'BigBasket': /bigbasket/i,
      'MakeMyTrip': /makemytrip/i,
      'BookMyShow': /bookmyshow/i,
      'Netflix': /netflix/i,
      'Spotify': /spotify/i,
      'Airtel': /airtel/i,
      'Jio': /jio/i,
      'Apple': /apple\.com|apple services/i,
      'Google Play': /google play/i,
      'HDFC Bank': /hdfc/i,
      'ICICI Bank': /icici/i,
      'SBI': /state bank of india|\bsbi\b/i,
      'Axis Bank': /axis bank/i,
      'Paytm': /paytm/i,
      'PhonePe': /phonepe/i,
      'Google Pay': /gpay|google pay/i,
      'HPCL / Petrol': /hpcl|hindustan petroleum/i,
      'Shell Fuel': /shell/i,
      'Apollo Pharmacy': /apollo/i,
      'Tata 1mg': /1mg/i,
      'SCRAFT / Raviraja': /scraft|raviraja/i,
    };

    for (const [name, regex] of Object.entries(vendorPatterns)) {
      if (regex.test(combined)) {
        // If it's a bank alert, check if there's an "Info: VPA / Info: Swiggy" sub-merchant
        if (name.includes('Bank') || name === 'SBI' || name === 'Paytm' || name === 'PhonePe') {
          const vpaMatch = snippet.match(/(?:to VPA|at|to)\s+([A-Za-z0-9_\-\.\s]{3,25})(?:\s+on|\.|\s+UPI)/i);
          if (vpaMatch && vpaMatch[1] && !vpaMatch[1].toLowerCase().includes('account')) {
            return `${vpaMatch[1].trim()} (${name})`;
          }
        }
        return name;
      }
    }

    // Try extracting sender display name e.g. "Swiggy Orders <orders@swiggy.in>" -> "Swiggy Orders"
    const senderNameMatch = fromHeader.match(/^"?([^"<]+)"?\s*</);
    if (senderNameMatch && senderNameMatch[1].trim()) {
      const cleanName = senderNameMatch[1].trim().replace(/alerts?|notifications?|service|updates?/gi, '').trim();
      if (cleanName.length > 2 && cleanName.length < 30) {
        return cleanName;
      }
    }

    // Try extracting recipient/store name from subject: "Order Placed at Starbucks"
    const atMatch = subject.match(/(?:at|from|to)\s+([A-Za-z0-9\s&]{3,25})/i);
    if (atMatch && atMatch[1]) {
      return atMatch[1].trim();
    }

    return 'Card / UPI Transaction';
  }

  /**
   * Determine expense category from context
   */
  public static categorizeText(text: string): ExpenseCategory {
    const lower = text.toLowerCase();
    for (const rule of CATEGORY_RULES) {
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) {
          return rule.category;
        }
      }
    }
    return 'Other';
  }

  /**
   * Detect payment method
   */
  private static detectPaymentMethod(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('upi') || lower.includes('@okhdfc') || lower.includes('@okaxis') || lower.includes('@ybl')) {
      return 'UPI';
    }
    if (lower.includes('credit card') || lower.includes('cc ending')) {
      return 'Credit Card';
    }
    if (lower.includes('debit card') || lower.includes('dc ending') || lower.includes('atm')) {
      return 'Debit Card';
    }
    if (lower.includes('netbanking') || lower.includes('net banking') || lower.includes('neft') || lower.includes('rtgs')) {
      return 'Net Banking';
    }
    if (lower.includes('wallet') || lower.includes('paytm wallet')) {
      return 'Wallet';
    }
    return 'Online Payment';
  }

  /**
   * Parse email date header to YYYY-MM-DD
   */
  private static parseDate(dateHeader: string): string {
    try {
      if (!dateHeader) return new Date().toISOString().split('T')[0];
      const parsed = new Date(dateHeader);
      if (isNaN(parsed.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return parsed.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
}
