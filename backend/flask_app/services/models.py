import cv2
import torch
import numpy as np
from torchvision import transforms
from torchvision.models.segmentation import deeplabv3_resnet101
import logging

logger = logging.getLogger(__name__)

class ModelService:

    @staticmethod
    def face_detector():
        # Kept Haar face detector in case you still need face-only detection
        return cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    @staticmethod
    def segmentation_model(device='cpu'):
        """
        Load a pretrained DeepLabV3 ResNet-101 model for person segmentation.
        Device can be 'cpu' or 'cuda'.
        """
        model = deeplabv3_resnet101(pretrained=True, progress=False)
        model.to(device).eval()
        return model

    @staticmethod
    def get_person_mask(model, frame, device='cpu', threshold=0.5):
        """
        Run the segmentation model on a single frame and return a binary mask
        (uint8) where person pixels==1.
        Uses COCO class index 15 for 'person'.
        """
        # Preprocess to 520×520 and normalize as expected by torchvision models
        preprocess = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((520, 520)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])
        input_tensor = preprocess(frame).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(input_tensor)['out'][0]
        # Softmax over classes, then threshold the 'person' channel
        person_prob = torch.softmax(output, dim=0)[15]
        mask = (person_prob > threshold).cpu().numpy().astype(np.uint8)

        # Resize mask back to original frame size
        mask = cv2.resize(mask, (frame.shape[1], frame.shape[0]),
                          interpolation=cv2.INTER_NEAREST)
        return mask