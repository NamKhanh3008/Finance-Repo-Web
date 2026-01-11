# app/routes/search_routes.py
from flask import Blueprint, request, jsonify
from ..services.news_service import NewsService
from .. import cache 

search_bp = Blueprint('search_bp', __name__)

@search_bp.route('/api/news/<ticker>', methods=['GET'])
@cache.cached(timeout=900) # Cache result for 15 minutes (900s)
def get_news(ticker):
    # 1. Call the service
    articles = NewsService.get_latest_news(ticker)
    
    # 2. Return JSON
    return jsonify(articles), 200