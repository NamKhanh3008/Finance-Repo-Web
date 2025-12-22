# app/services/news_service.py
import yfinance as yf
from datetime import datetime

class NewsService:
    @staticmethod
    def get_latest_news(ticker_symbol):
        try:
            stock = yf.Ticker(ticker_symbol)
            news_items = stock.news
            
            clean_news = []
            
            for item in news_items:
                # 1. HANDLE NESTED STRUCTURE (The Fix)
                # Yahoo now puts everything inside a 'content' key
                data = item.get('content', item)

                # 2. EXTRACT TITLE & LINK
                title = data.get('title')
                
                # Link is now buried inside 'clickThroughUrl' or 'canonicalUrl'
                link = None
                if 'clickThroughUrl' in data and data['clickThroughUrl']:
                    link = data['clickThroughUrl'].get('url')
                elif 'canonicalUrl' in data and data['canonicalUrl']:
                    link = data['canonicalUrl'].get('url')
                
                # If we still can't find critical info, skip this item
                if not title or not link:
                    continue

                # 3. EXTRACT THUMBNAIL
                thumbnail_url = None
                try:
                    # Try to get the first resolution
                    thumbnail_url = data['thumbnail']['resolutions'][0]['url']
                except (KeyError, IndexError, TypeError):
                    thumbnail_url = None

                # 4. EXTRACT DATE
                # The new format uses an ISO string 'pubDate': '2025-12-09T14:36:33Z'
                date_str = "Recent"
                try:
                    raw_date = data.get('pubDate') # Try ISO string first
                    if raw_date:
                        # Convert "2025-12-09T14:36:33Z" to datetime object
                        dt_object = datetime.strptime(raw_date, "%Y-%m-%dT%H:%M:%SZ")
                        date_str = dt_object.strftime('%Y-%m-%d %H:%M')
                    else:
                        # Fallback to old Unix timestamp if ISO is missing
                        timestamp = data.get('providerPublishTime')
                        if timestamp:
                            date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M')
                except Exception:
                    pass

                clean_news.append({
                    "id": item.get('id') or data.get('id'),
                    "title": title,
                    "publisher": data.get('provider', {}).get('displayName', 'Yahoo Finance'),
                    "link": link,
                    "thumbnail": thumbnail_url,
                    "date": date_str
                })
            
            return clean_news
            
        except Exception as e:
            print(f"News Error: {e}")
            return []