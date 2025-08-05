from flask_restx import Resource, fields
import logging
from . import api_ns

logger = logging.getLogger(__name__)

def register_hello_routes(api):
    """Register hello world routes and models"""
    
    # Define response models
    hello_model = api.model('HelloResponse', {
        'Hello': fields.String(required=True, description='Greeting message')
    })
    
    @api_ns.route('/hello-world')
    class HelloWorld(Resource):
        @api_ns.doc('hello_world')
        @api_ns.marshal_with(hello_model)
        @api_ns.response(200, 'Success', hello_model)
        @api_ns.response(500, 'Internal Server Error')
        def get(self):
            """Get a hello world message"""
            try:
                return {"Hello": "World"}, 200
            except Exception as e:
                logger.error(f"Error: {e}")
                api.abort(500, error=str(e))