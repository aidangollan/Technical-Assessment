import cv2
import logging

logger = logging.getLogger(__name__)

class VideoInfoService:

    @staticmethod
    def get_video_info(video_url: str) -> dict:
        """
        Get basic information about a video from URL
        
        Args:
            video_url (str): URL to the video file
            
        Returns:
            dict: Video information
        """
        try:
            cap = cv2.VideoCapture(video_url)
            
            if not cap.isOpened():
                raise Exception(f"Could not open video stream from {video_url}")
            
            info = {
                'fps': int(cap.get(cv2.CAP_PROP_FPS)),
                'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                'frame_count': int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            }
            
            cap.release()
            return info
            
        except Exception as e:
            logger.error(f"Error getting video info: {str(e)}")
            raise e
