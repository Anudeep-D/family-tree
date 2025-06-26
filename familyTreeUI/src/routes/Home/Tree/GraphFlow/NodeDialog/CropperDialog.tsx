import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import imageCompression from "browser-image-compression";
import "react-image-crop/dist/ReactCrop.css";

interface CropperDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  imgSrc: string;
  nodeId: string;
  treeId: string;
}

const CropperDialog: React.FC<CropperDialogProps> = ({
  open,
  onClose,
  onConfirm,
  imgSrc,
  nodeId,
  treeId,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1)); //圆形，所以1:1
  };

  async function getCroppedImg(
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<File | null> {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("No 2d context");
      return null;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], fileName, { type: "image/png" });
          resolve(file);
        },
        "image/png",
        1
      );
    });
  }

  const handleCropConfirm = async () => {
    if (completedCrop && imgRef.current) {
      setIsProcessing(true);
      let finalFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        `${nodeId}_cropped.png` // It's good practice to use a unique name, perhaps with treeId too
      );

      if (finalFile) {
        console.log(`Original cropped file size: ${finalFile.size / 1024} KB`);
        if (finalFile.size > 500 * 1024) {
          const options = {
            maxSizeMB: 0.5, // Max size in MB
            // maxWidthOrHeight: 1920, // You can set max dimensions if needed
            useWebWorker: true,
            // Consider adding other options like initialQuality if needed
          };
          try {
            const compressedFile = await imageCompression(finalFile, options);
            console.log(
              `Compressed file size: ${compressedFile.size / 1024} KB`
            );
            finalFile = compressedFile; // Use the compressed file
          } catch (error) {
            console.error("Error during image compression:", error);
            // If compression fails, finalFile remains the original cropped file
          }
        }
        onConfirm(finalFile); // Pass the final (potentially compressed) file
      }
      setIsProcessing(false);
    }
    onClose(); // Close the dialog
  };

  const handleCropCancel = () => {
    onClose();
  };

  // Reset crop when image changes
  useEffect(() => {
    if (imgSrc && imgRef.current) {
      const { width, height } = imgRef.current;
      if (width && height) {
        // ensure dimensions are available
        setCrop(centerAspectCrop(width, height, 1 / 1));
      }
    }
  }, [imgSrc]);

  return (
    <Dialog open={open} onClose={handleCropCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} //圆形，所以1:1
            circularCrop={true}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ maxHeight: "70vh", width: "auto" }}
            />
          </ReactCrop>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          disabled={isProcessing}
          onClick={handleCropCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={isProcessing}
          onClick={handleCropConfirm}
          color="primary"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropperDialog;
