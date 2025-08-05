import os
import subprocess
import logging

from flask_app.helpers import get_temp_path

logger = logging.getLogger(__name__)

class VideoCompressionService:
    @staticmethod
    def compress_to_target(input_path: str, target_size_mb: int = 50) -> str:
        """
        Compress a video file to attempt to meet a maximum size, using CRF H.264.

        Args:
            input_path: Path to the original video.
            target_size_mb: Desired maximum file size in megabytes.

        Returns:
            Path to the compressed video file.
        """
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")

        base, _ = os.path.splitext(input_path)
        compressed_path = f"{base}_compressed.mp4"

        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-c:v", "libx264",
            "-crf", "28",
            "-preset", "medium",
            "-c:a", "aac",
            "-b:a", "128k",
            compressed_path
        ]

        logger.info(f"Compressing video: {' '.join(ffmpeg_cmd)}")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"FFmpeg compression failed: {result.stderr}")
            raise RuntimeError("Video compression failed")

        final_size_mb = os.path.getsize(compressed_path) / (1024 * 1024)
        logger.info(f"Compression complete: {compressed_path} is {final_size_mb:.2f} MB")
        return compressed_path