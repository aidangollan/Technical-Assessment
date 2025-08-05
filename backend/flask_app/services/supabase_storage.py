import os
import logging
from supabase import create_client, Client
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
video_bucket = os.getenv('SUPABASE_BUCKET_NAME', 'videos')

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
            
            # Generate unique filename if not provided
            if not filename:
                file_extension = os.path.splitext(file_path)[1]
                filename = f"processed_{uuid.uuid4()}{file_extension}"
            
            # Read file content
            with open(file_path, 'rb') as file:
                file_content = file.read()
            
            # Upload to Supabase storage
            storage_path = f"processed/{filename}"
            
            logger.info(f"Uploading {file_path} to Supabase bucket '{video_bucket}' as '{storage_path}'")
            
            response = client.storage.from_(video_bucket).upload(
                storage_path,
                file_content,
                file_options={"content-type": "video/mp4"}
            )
            
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Upload failed: {response.error}")
            
            # Get public URL
            public_url_response = client.storage.from_(video_bucket).get_public_url(storage_path)
            
            # Clean up local file after successful upload
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up local file: {file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up local file {file_path}: {cleanup_error}")
            
            result = {
                'success': True,
                'storage_path': storage_path,
                'public_url': public_url_response,
                'filename': filename,
                'bucket': video_bucket
            }
            
            logger.info(f"Successfully uploaded video to: {public_url_response}")
            return result
            
        except Exception as e:
            logger.error(f"Error uploading video to Supabase: {e}")
            raise e
    
    @staticmethod
    def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
        """
        Generate a signed URL for private access to a file
        
        Args:
            storage_path (str): Path to the file in storage
            expires_in (int): URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Signed URL
        """
        try:
            response = client.storage.from_(video_bucket).create_signed_url(
                storage_path, expires_in
            )
            return response.get('signedURL', '')
        except Exception as e:
            logger.error(f"Error creating signed URL: {e}")
            raise e