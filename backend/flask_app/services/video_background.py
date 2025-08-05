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
                                             device: str = None) -> str:
        """
        Download video from URL, segment the speaker, apply a background filter,
        and upload the processed video to Supabase.
        """
        cap = cv2.VideoCapture(video_url)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open video stream from {video_url}")

        fps    = int(cap.get(cv2.CAP_PROP_FPS))
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        logger.info(f"Video properties: {width}x{height} @ {fps}fps")

        output_path = get_temp_path() + ".mp4"
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        model = ModelService.segmentation_model()
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            mask = ModelService.get_person_mask(model, frame)
            mask_3ch = np.repeat(mask[:, :, None], 3, axis=2)

            if effect == 'gray':
                bg = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                bg = cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR)
            elif effect == 'sepia':
                kernel = np.array([[0.272, 0.534, 0.131],
                                   [0.349, 0.686, 0.168],
                                   [0.393, 0.769, 0.189]])
                bg = cv2.transform(frame, kernel)
                bg = np.clip(bg, 0, 255).astype(np.uint8)
            elif effect == 'blur':
                bg = cv2.GaussianBlur(frame, (21, 21), sigmaX=0, sigmaY=0)
            elif effect == 'pixelate':
                h, w = frame.shape[:2]
                small = cv2.resize(frame, (w//16, h//16), interpolation=cv2.INTER_LINEAR)
                bg = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
            elif effect == 'invert':
                bg = 255 - frame
            elif effect == 'cartoon':
                color = cv2.bilateralFilter(frame, d=9, sigmaColor=75, sigmaSpace=75)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                edges = cv2.adaptiveThreshold(
                    cv2.medianBlur(gray, 7),
                    255,
                    cv2.ADAPTIVE_THRESH_MEAN_C,
                    cv2.THRESH_BINARY,
                    blockSize=9,
                    C=2
                )
                edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
                bg = cv2.bitwise_and(color, edges_colored)
            elif effect == 'pencil':
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                inv = 255 - gray
                blur = cv2.GaussianBlur(inv, (21, 21), 0)
                sketch = cv2.divide(gray, 255 - blur, scale=256)
                bg = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
            elif effect == 'thermal':
                bg = cv2.applyColorMap(frame, cv2.COLORMAP_JET)
            else:
                logger.warning(f"Unknown effect '{effect}', defaulting to gray")
                bg = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                bg = cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR)

            composite = np.where(mask_3ch == 1, frame, bg)
            out.write(composite)

            if frame_count % 30 == 0:
                logger.info(f"Processed {frame_count} frames")

        cap.release()
        out.release()

        if not (os.path.exists(output_path) and os.path.getsize(output_path) > 0):
            raise RuntimeError("Optimized video file was not created successfully")

        upload_result = SupabaseStorageService.upload_video(output_path)
        logger.info(f"Finished processing {frame_count} frames, output at {output_path}")

        return upload_result['public_url']
