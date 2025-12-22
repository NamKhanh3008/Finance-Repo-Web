# app/services/stock_service.py
import yfinance as yf
import pandas as pd

class StockService:
    @staticmethod
    def get_stock_data(ticker):
        try:
            # 1. Fetch Ticker
            stock = yf.Ticker(ticker)
            
            # 2. Get Chart Data (1 Month History)
            hist = stock.history(period="1mo", interval="1d")
            
            if hist.empty:
                return None

            # 3. Clean Chart Data for Recharts
            hist.reset_index(inplace=True)
            chart_data = []
            for _, row in hist.iterrows():
                chart_data.append({
                    "date": row["Date"].strftime('%Y-%m-%d'),
                    "price": round(row["Close"], 2)
                })

            # 4. Get Key Stats
            info = stock.info
            
            stats = {
                "symbol": info.get("symbol", ticker),
                "shortName": info.get("shortName", ticker),
                "currentPrice": info.get("currentPrice") or info.get("regularMarketPrice", 0),
                "marketCap": info.get("marketCap", 0),
                "peRatio": info.get("trailingPE", "N/A"),
                "high": info.get("dayHigh", 0),
                "low": info.get("dayLow", 0),
                "open": info.get("open", 0),
                "prevClose": info.get("previousClose", 0),
                "volume": info.get("volume", 0)
            }

            # 5. Calculate Change
            if stats["currentPrice"] and stats["prevClose"]:
                change = stats["currentPrice"] - stats["prevClose"]
                percent = (change / stats["prevClose"]) * 100
                stats["change"] = round(change, 2)
                stats["changePercent"] = round(percent, 2)
            else:
                stats["change"] = 0
                stats["changePercent"] = 0

            return { "chart": chart_data, "stats": stats }

        except Exception as e:
            print(f"StockService Error: {e}")
            return None