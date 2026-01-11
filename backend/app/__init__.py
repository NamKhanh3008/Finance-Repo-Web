# app/__init__.py
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from flask_caching import Cache
from .db.database import db

# Initialize extensions
migrate = Migrate()
jwt = JWTManager()

# Define Cache Globally
cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object("config.Config")

    # Enable CORS
    CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)


    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cache.init_app(app)

    # Import Models
    from app.models import User, File, Folder

    # ------------------------------------------------------------
    # REGISTER BLUEPRINTS
    # ------------------------------------------------------------
    
    # 1. File Routes
    from app.routes.file_routes import file_bp
    app.register_blueprint(file_bp)
    
    # 2. Auth Routes
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # 3. Stock Routes (The Engine)
    from app.routes.stock_routes import stock_bp
    app.register_blueprint(stock_bp)

    # 4. Search Routes (REMOVED for now)
    from app.routes.search_routes import search_bp
    app.register_blueprint(search_bp)

    # 5. Annotation Routes (FIXED)
    from app.routes.annotation_routes import annotation_bp
    # You must add url_prefix="/api/annotations" here!
    app.register_blueprint(annotation_bp, url_prefix="/api/annotation")

    

    #6. Fork Routes
    from app.routes.fork_routes import fork_bp
    app.register_blueprint(fork_bp, url_prefix="/api/fork")

    return app
