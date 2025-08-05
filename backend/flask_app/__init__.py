import logging
from flask import Flask
from .extensions import api, cors
from .routes import init_api

logging.basicConfig(level=logging.INFO)

def create_app():
    app = Flask(__name__)
    
    api.init_app(app)
    cors.init_app(app)

    # If app context is needed in future
    with app.app_context():
        init_api(api)
        return app
