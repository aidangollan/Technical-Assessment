from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from config import configure_app
from routes.api import api_ns
from routes.api.hello import register_hello_routes

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app)
    
    # Configure app settings
    configure_app(app)
    
    # Initialize Flask-RESTX
    api = Api(
      app,
      version='1.0',
      title='Face Detection API',
      description='A Flask-RESTX API for face detection functionality',
      doc='/docs/'  # Swagger UI will be available at /docs/
    )
    
    # Register route modules
    register_hello_routes(api)
    
    # Add namespace to API
    api.add_namespace(api_ns)
    
    return app

app = create_app()



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True, use_reloader=False)
