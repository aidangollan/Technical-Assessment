import logging
from dotenv import load_dotenv

def configure_app(app):
    """Configure Flask app settings"""
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    return app