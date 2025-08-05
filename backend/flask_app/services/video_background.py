import os
import cv2
import numpy as np
import logging
import tempfile
import hashlib
import subprocess

from typing import List, Dict, Any

from flask_app.services.models import ModelService
from flask_app.services.compress import VideoCompressionService
from flask_app.services.supabase_storage import SupabaseStorageService
from flask_app.helpers import get_temp_path

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(tempfile.gettempdir(), 'video_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

class VideoBackgroundService:

    @staticmethod
    def apply_filter(frame: np.ndarray, filter_type: str) -> np.ndarray:
        if filter_type == 'gray':
            bg = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR)
        if filter_type == 'sepia':
            kernel = np.array([[0.272, 0.534, 0.131],
                               [0.349, 0.686, 0.168],
                               [0.393, 0.769, 0.189]])
            sep = cv2.transform(frame, kernel)
            return np.clip(sep, 0, 255).astype(np.uint8)
        if filter_type == 'blur':
            return cv2.GaussianBlur(frame, (21, 21), sigmaX=0, sigmaY=0)
        if filter_type == 'pixelate':
            h, w = frame.shape[:2]
            small = cv2.resize(frame, (w // 16, h // 16), interpolation=cv2.INTER_LINEAR)
            return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        if filter_type == 'invert':
            return 255 - frame
        if filter_type == 'cartoon':
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
            return cv2.bitwise_and(color, edges_colored)
        if filter_type == 'pencil':
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            inv = 255 - gray
            blur = cv2.GaussianBlur(inv, (21, 21), 0)
            sketch = cv2.divide(gray, 255 - blur, scale=256)
            return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
        if filter_type == 'thermal':
            return cv2.applyColorMap(frame, cv2.COLORMAP_JET)
        logger.warning(f"Unknown filter_type '{filter_type}', defaulting to gray")
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    @staticmethod
    def process_video_with_background_filter(
        video_url: str,
        effects: List[Dict[str, Any]],
        device: str = None
    ) -> str:
        """
        Download video, segment the speaker, apply time-based filters (blending overlaps),
        compress result, and upload to Supabase. Masks and per-filter backgrounds
        are cached per video URL, so repeated runs or overlapping filters
        never recompute the same data twice.
        """
        video_hash = hashlib.md5(video_url.encode('utf-8')).hexdigest()
        video_cache_dir = os.path.join(CACHE_DIR, video_hash)
        mask_cache_dir = os.path.join(video_cache_dir, 'masks')
        filter_cache_dir = os.path.join(video_cache_dir, 'filters')

        first_run = not os.path.isdir(mask_cache_dir)
        if first_run:
            os.makedirs(mask_cache_dir, exist_ok=True)
            os.makedirs(filter_cache_dir, exist_ok=True)
        else:
            os.makedirs(filter_cache_dir, exist_ok=True)

        cap = cv2.VideoCapture(video_url)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open video stream from {video_url}")

        fps    = cap.get(cv2.CAP_PROP_FPS)
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        logger.info(f"Video properties: {width}x{height} @ {fps:.2f}fps")

        raw_path = get_temp_path() + ".mp4"
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(raw_path, fourcc, fps, (width, height))
        if not out.isOpened():
            raise RuntimeError(f"Could not open VideoWriter for {raw_path}")

        if device is None:
            use_gpu_env = os.getenv("USE_GPU", "false").lower() == 'gpu'
            device = "cuda" if use_gpu_env else "cpu"
        logger.info(f"Using device: {device}")
        model_tuple = ModelService.segmentation_model(device)
        frame_index = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_index += 1

            mask_file = os.path.join(mask_cache_dir, f"{frame_index}.npy")
            if first_run:
                mask = ModelService.get_person_mask(model_tuple, frame)
                np.save(mask_file, mask)
            else:
                mask = np.load(mask_file)
            mask_3ch = np.repeat(mask[:, :, None], 3, axis=2)

            timestamp_ms = (frame_index / fps) * 1000
            active = [
                item['filterType'] for item in effects
                if item['startTime'] <= timestamp_ms < item['endTime']
            ]

            if not active:
                composite = frame
            else:
                bgs = []
                for ft in active:
                    filt_file = os.path.join(filter_cache_dir, f"{frame_index}_{ft}.npy")
                    if os.path.exists(filt_file):
                        bg = np.load(filt_file)
                    else:
                        bg = VideoBackgroundService.apply_filter(frame, ft)
                        np.save(filt_file, bg)
                    bgs.append(bg)

                blended = np.mean(np.stack(bgs, axis=0), axis=0).astype(np.uint8)
                composite = np.where(mask_3ch == 1, frame, blended)

            out.write(composite)
            if frame_index % 30 == 0:
                logger.info(f"Processed {frame_index} frames")

        cap.release()
        out.release()

        if not (os.path.exists(raw_path) and os.path.getsize(raw_path) > 0):
            raise RuntimeError("Processed video file was not created successfully")

        audio_path = get_temp_path() + ".aac"
        subprocess.run(
            ["ffmpeg", "-y", "-i", video_url, "-vn", "-c:a", "copy", audio_path],
            check=True
        )
        combined_path = get_temp_path() + "_with_audio.mp4"
        subprocess.run(
            ["ffmpeg", "-y", "-i", raw_path, "-i", audio_path, "-c:v", "copy", "-c:a", "aac", combined_path],
            check=True
        )

        compressed_path = VideoCompressionService.compress_to_target(
            combined_path, target_size_mb=50
        )
        try:
            os.remove(raw_path)
        except OSError:
            logger.warning(f"Could not delete intermediate file {raw_path}")
        try:
            os.remove(audio_path)
        except OSError:
            logger.warning(f"Could not delete audio file {audio_path}")
        try:
            os.remove(combined_path)
        except OSError:
            logger.warning(f"Could not delete combined file {combined_path}")

        upload_result = SupabaseStorageService.upload_video(compressed_path)
        try:
            os.remove(compressed_path)
        except OSError:
            logger.warning(f"Could not delete compressed file {compressed_path}")

        logger.info(
            f"Finished processing {frame_index} frames, uploaded at {upload_result['public_url']}"
        )
        return upload_result['public_url']
