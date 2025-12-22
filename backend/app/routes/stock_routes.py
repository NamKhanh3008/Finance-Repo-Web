# app/routes/stock_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.services.stock_service import StockService
from app import cache  # <--- Import the global cache

stock_bp = Blueprint('stock_bp', __name__, url_prefix="/api/stock")

@stock_bp.route("/<ticker>", methods=["GET"])
@jwt_required()
@cache.cached(timeout=300, query_string=True) # <--- 300 seconds = 5 minutes
def get_stock(ticker):
    clean_ticker = ticker.strip().upper()
    
    # Security check: Basic alpha-numeric only
    if not clean_ticker.isalnum():
         return jsonify({"error": "Invalid ticker"}), 400

    data = StockService.get_stock_data(clean_ticker)
    
    if not data:
        return jsonify({"error": "Stock not found"}), 404
        
    return jsonify(data), 200