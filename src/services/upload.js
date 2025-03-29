import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'fs';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * Upload file to Cloudinary
 * @param {File} file - File to upload
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadToCloudinary = async (file, folder = 'default') => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      
      // If file is buffer (from multer memory storage)
      if (Buffer.isBuffer(file)) {
        uploadStream.end(file);
      } else {
        // If file is from fs.createReadStream
        createReadStream(file.path).pipe(uploadStream);
      }
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileType: result.format,
      fileSize: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Save uploaded file details to the database
 * @param {Object} fileData - File data including url, publicId, etc.
 * @param {string} fileName - Original file name
 * @param {string} purpose - Purpose of the file (e.g., DOCTOR_PROFILE)
 * @param {string} entityId - ID of the related entity (e.g., doctorId)
 * @param {string} uploadedBy - User ID who uploaded the file
 * @returns {Promise<Object>} - Created Media record
 */
const saveFileToDatabase = async (fileData, fileName, purpose, entityId, uploadedBy) => {
  try {
    const media = await prisma.media.create({
      data: {
        fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
        url: fileData.url,
        publicId: fileData.publicId,
        purpose,
        entityId,
        uploadedBy,
      },
    });
    return media;
  } catch (error) {
    console.error('Error saving file to database:', error);
    // If there's an error saving to the database, delete the file from Cloudinary
    if (fileData.publicId) {
      await deleteFromCloudinary(fileData.publicId);
    }
    throw new Error('Failed to save file information');
  }
};

/**
 * Upload an image for a doctor
 * @param {File} file - File to upload
 * @param {string} doctorId - Doctor ID
 * @param {string} userId - User ID who is uploading
 * @param {string} purpose - Purpose of the image (profile or gallery)
 * @returns {Promise<Object>} - Uploaded file data
 */
const uploadDoctorImage = async (file, doctorId, userId, purpose = 'DOCTOR_PROFILE') => {
  const fileData = await uploadToCloudinary(file, 'doctors');
  const media = await saveFileToDatabase(
    fileData,
    file.originalname,
    purpose,
    doctorId,
    userId
  );
  
  // Update doctor with the new image URL if it's a profile image
  if (purpose === 'DOCTOR_PROFILE') {
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { imageUrl: fileData.url },
    });
  } else if (purpose === 'DOCTOR_GALLERY') {
    // Add image to doctor's gallery
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        galleryImages: {
          push: fileData.url,
        },
      },
    });
  }
  
  return media;
};

/**
 * Upload an image for a patient
 * @param {File} file - File to upload
 * @param {string} patientId - Patient ID
 * @param {string} userId - User ID who is uploading
 * @returns {Promise<Object>} - Uploaded file data
 */
const uploadPatientImage = async (file, patientId, userId) => {
  const fileData = await uploadToCloudinary(file, 'patients');
  const media = await saveFileToDatabase(
    fileData,
    file.originalname,
    'PATIENT_PROFILE',
    patientId,
    userId
  );
  
  // Update patient with the new image URL
  await prisma.patient.update({
    where: { id: patientId },
    data: { profileImage: fileData.url },
  });
  
  return media;
};

/**
 * Upload images for a review
 * @param {File[]} files - Files to upload
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID who is uploading
 * @returns {Promise<Object[]>} - Uploaded files data
 */
const uploadReviewImages = async (files, reviewId, userId) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, 'reviews'));
  const fileDataArray = await Promise.all(uploadPromises);
  
  const imageUrls = fileDataArray.map(data => data.url);
  
  // Update review with image URLs
  await prisma.doctorReview.update({
    where: { id: reviewId },
    data: { images: imageUrls },
  });
  
  // Save file details to database
  const savePromises = fileDataArray.map((fileData, index) => 
    saveFileToDatabase(
      fileData,
      files[index].originalname,
      'REVIEW_IMAGE',
      reviewId,
      userId
    )
  );
  
  return Promise.all(savePromises);
};

export {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  saveFileToDatabase,
  uploadDoctorImage,
  uploadPatientImage,
  uploadReviewImages,
}; 