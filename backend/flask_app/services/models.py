import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import models
from torchvision.models.detection import MaskRCNN_ResNet50_FPN_Weights

class ModelService:

    @staticmethod
    def segmentation_model(device: str = None):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        weights = MaskRCNN_ResNet50_FPN_Weights.DEFAULT
        model = models.detection.maskrcnn_resnet50_fpn(weights=weights, progress=False)
        model.to(device)
        model.eval()
        input_transform = weights.transforms()
        return model, device, input_transform

    @staticmethod
    def get_person_mask(model_tuple, frame, score_thresh: float = 0.7):
        model, device, input_transform = model_tuple
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        inp = input_transform(pil_img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(inp)[0]
        masks = []
        for label, score, mask in zip(outputs['labels'], outputs['scores'], outputs['masks']):
            if label.item() == 1 and score.item() >= score_thresh:
                bin_mask = (mask[0].cpu().numpy() > 0.5).astype(np.uint8)
                masks.append(bin_mask)
        if not masks:
            return np.zeros(frame.shape[:2], dtype=np.uint8)
        combined = np.clip(np.sum(masks, axis=0), 0, 1).astype(np.uint8)
        return combined
