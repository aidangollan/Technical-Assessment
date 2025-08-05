import cv2
import numpy as np
import mediapipe as mp

class ModelService:

    @staticmethod
    def segmentation_model():
        mp_selfie = mp.solutions.selfie_segmentation
        return mp_selfie.SelfieSegmentation(model_selection=1)

    @staticmethod
    def get_person_mask(model, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = model.process(rgb)
        if results.segmentation_mask is None:
            return np.zeros(frame.shape[:2], dtype=np.uint8)
        mask = results.segmentation_mask
        binary = (mask > 0.5).astype(np.uint8)
        return binary
