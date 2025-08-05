import os
import logging
from supabase import create_client, Client
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
video_bucket = os.getenv('SUPABASE_VIDEO_BUCKET_NAME', 'videos')
video_bucket_path = os.getenv('SUPABASE_URL') + os.getenv('SUPABASE_VIDEO_BUCKET_PATH')

class SupabaseStorageService:

    @staticmethod    
    def upload_video(file_path: str, filename: Optional[str] = None) -> dict:
        """
        Upload a video file to Supabase storage
        
        Args:
            file_path (str): Local path to the video file
            filename (str, optional): Custom filename. If None, generates a unique name
            
        Returns:
            dict: Upload result with public URL
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if not filename:
                _, ext = os.path.splitext(file_path)
                filename = f"processed_{uuid.uuid4()}{ext}"
            
            storage_path = f"processed/{filename}"
            logger.info(f"Uploading {file_path} to Supabase bucket '{video_bucket}'")
            
            upload_response = client.storage.from_(video_bucket).upload(
                storage_path,
                file_path,
                file_options={"content-type": "video/mp4"}
            )
                        
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up local file: {file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up local file {file_path}: {cleanup_error}")
            
            result = {
                'success': True,
                'storage_path': storage_path,
                'public_url': video_bucket_path + upload_response.full_path,
                'filename': filename,
                'bucket': video_bucket
            }
            
            logger.info(f"Successfully uploaded video to: {upload_response}")
            return result
            
        except Exception as e:
            logger.error(f"Error uploading video to Supabase: {e}")
            raise e