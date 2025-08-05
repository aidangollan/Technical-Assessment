from flask_restx import Resource, fields
from flask import request
import logging

from flask_app.services.video_background import VideoBackgroundService
from flask_app.routes import api_ns

logger = logging.getLogger(__name__)

def video_routes():
    """Register video processing routes and models"""
    
    timeline_item_model = api_ns.model('TimelineItem', {
        'id': fields.String(required=True, description='Unique identifier for the timeline item'),
        'filterType': fields.String(required=True, description='Type of filter to apply'),
        'startTime': fields.Integer(required=True, description='Start time in milliseconds'),
        'endTime': fields.Integer(required=True, description='End time in milliseconds'),
    })
    
    video_request_model = api_ns.model('VideoRequest', {
        'url': fields.String(required=True, description='URL to the video file'),
        'effects': fields.List(fields.Nested(timeline_item_model), required=True, description='List of timeline items specifying effects'),
    })
    
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
                if not data or 'url' not in data or 'effects' not in data:
                    api_ns.abort(400, 'videoUrl and effects are required')
                
                url = data['url']
                effects = data['effects']
                
                logger.info(f"Starting video processing for URL: {url} with effects: {effects}")
                
                output_url = VideoBackgroundService.process_video_with_background_filter(url, effects)
                
                logger.info(f"Video processing completed. Output URL: {output_url}")
                
                return {
                    'message': 'Video processed successfully with background filter applied and uploaded to Supabase storage',
                    'input_url': url,
                    'output_url': output_url
                }, 200
                
            except Exception as e:
                logger.error(f"Error processing video: {e}")
                api_ns.abort(500, error=str(e))
