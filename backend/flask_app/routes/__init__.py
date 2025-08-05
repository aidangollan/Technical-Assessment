from flask_restx import Namespace

api_ns = Namespace('api', description='API operations')

def init_api(api):
    from .hello import hello_routes
    from .video import video_routes
    
    hello_routes()
    video_routes()
    
    api.add_namespace(api_ns)