import cv2
import os
import numpy as np
import logging
from flask_app.services.models import ModelService
from flask_app.services.supabase_storage import SupabaseStorageService
from flask_app.helpers import get_temp_path

logger = logging.getLogger(__name__)

class VideoBackgroundService:

    @staticmethod
    def process_video_with_background_filter(video_url: str,
                                             effect: str = 'gray',
                                             device: str = 'cpu') -> str:
        """
        Download video from URL, segment the speaker, apply a background filter
        (gray or sepia), and upload the processed video to Supabase.

        Args:
            video_url (str): Source video URL
            effect (str): 'gray' or 'sepia'
            device (str): 'cpu' or 'cuda' for model inference

        Returns:
            str: Public URL of the processed video
        """
        cap = cv2.VideoCapture(video_url)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open video stream from {video_url}")

        fps    = int(cap.get(cv2.CAP_PROP_FPS))
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        logger.info(f"Video properties: {width}x{height} @ {fps}fps")

        output_path = get_temp_path() + ".mp4"
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Load segmentation model once
        model = ModelService.segmentation_model(device=device)
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            # Get binary person mask
            mask = ModelService.get_person_mask(model, frame, device=device)

            # Build filtered background
            if effect == 'gray':
                bg = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                bg = cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR)
            elif effect == 'sepia':
                kernel = np.array([[0.272, 0.534, 0.131],
                                   [0.349, 0.686, 0.168],
                                   [0.393, 0.769, 0.189]])
                bg = cv2.transform(frame, kernel)
                bg = np.clip(bg, 0, 255).astype(np.uint8)
            else:
                logger.warning(f"Unknown effect '{effect}', defaulting to gray")
                bg = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                bg = cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR)

            # Composite: where mask==1 keep original, else use bg
            mask_3ch = np.repeat(mask[:, :, None], 3, axis=2)
            composite = np.where(mask_3ch == 1, frame, bg)

            out.write(composite)

            if frame_count % 30 == 0:
                logger.info(f"Processed {frame_count} frames")

        cap.release()
        out.release()
        logger.info(f"Finished processing {frame_count} frames, output at {output_path}")

        if not (os.path.exists(output_path) and os.path.getsize(output_path) > 0):
            raise RuntimeError("Output video file was not created successfully")

        upload_result = SupabaseStorageService.upload_video(output_path)
        return upload_result['public_url']