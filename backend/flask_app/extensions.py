from flask_cors import CORS
from flask_restx import Api

api = Api(
    version='1.0',
    title='Face Detection API',
    description='A Flask-RESTX API for face detection functionality',
    doc='/docs/' # Swagger UI endpoint
)

cors = CORS()