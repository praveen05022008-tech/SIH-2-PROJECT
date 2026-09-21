import os
import logging
from typing import Dict, Any, Optional
import cloudinary
import cloudinary.uploader
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Cloudinary configuration
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info(f"Cloudinary initialized with cloud_name={settings.CLOUDINARY_CLOUD_NAME}")
else:
    logger.warning("Cloudinary credentials missing or incomplete in settings.")

def upload_file_to_cloudinary(
    file_bytes_or_buffer,
    folder: str = "aic_portal",
    resource_type: str = "auto",
    public_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Uploads a file (resume, image, certificate, deliverable) to Cloudinary.
    Returns dictionary with:
      - secure_url: Public CDN URL
      - public_id: Cloudinary public ID
      - format: file extension/format
      - bytes: file size in bytes
      - resource_type: image / raw / video / auto
    """
    try:
        upload_params = {
            "folder": folder,
            "resource_type": resource_type,
            "overwrite": True
        }
        if public_id:
            upload_params["public_id"] = public_id

        response = cloudinary.uploader.upload(file_bytes_or_buffer, **upload_params)
        return {
            "success": True,
            "secure_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
            "format": response.get("format"),
            "bytes": response.get("bytes"),
            "resource_type": response.get("resource_type")
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise RuntimeError(f"Cloudinary upload error: {str(e)}")
