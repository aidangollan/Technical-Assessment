from flask_restx import Resource, fields
from flask import request
import logging

from flask_app.services.video_background import VideoBackgroundService
from flask_app.services.video_info import VideoInfoService
from flask_app.routes import api_ns

logger = logging.getLogger(__name__)

def video_routes():
    """Register video processing routes and models"""
    
    # request models
    video_request_model = api_ns.model('VideoRequest', {
        'url': fields.String(required=True, description='URL to the video file')
    })
    
    # response models
    video_response_model = api_ns.model('VideoResponse', {
        'message': fields.String(required=True, description='Processing status message'),
        'input_url': fields.String(required=True, description='The input video URL'),
        'output_url': fields.String(required=True, description='Public URL to processed video in Supabase storage'),
    })
    
    @api_ns.route('/background-effect')
    class BackgroundEffect(Resource):
        @api_ns.doc('background_effect')
        @api_ns.expect(video_request_model)
        @api_ns.marshal_with(video_response_model)
        @api_ns.response(200, 'Success', video_response_model)
        @api_ns.response(400, 'Bad Request')
        @api_ns.response(500, 'Internal Server Error')
        def post(self):
            """Process video with background effect"""
            try:
                data = request.get_json()
                if not data or 'url' not in data:
                    api_ns.abort(400, 'URL is required')
                
                video_url = data['url']
                
                logger.info(f"Starting video processing for URL: {video_url}")
                
                # Process the video (now returns Supabase URL)
                output_url = VideoBackgroundService.process_video_with_background_filter(video_url)
                
                logger.info(f"Video processing completed. Output URL: {output_url}")
                
                return {
                    'message': 'Video processed successfully with background filter applied and uploaded to Supabase storage',
                    'input_url': video_url,
                    'output_url': output_url,
                    'video_info': None
                }, 200
                
            except Exception as e:
                logger.error(f"Error processing video: {e}")
                api_ns.abort(500, error=str(e))