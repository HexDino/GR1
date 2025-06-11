import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'fs';

const prisma = new PrismaClient();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình multer cho memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file hình ảnh
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * Tải file lên Cloudinary
 * @param {File} file - File cần tải lên
 * @param {string} folder - Thư mục Cloudinary để tải lên
 * @returns {Promise<Object>} - Phản hồi từ Cloudinary upload
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
      
      // Nếu file là buffer (từ multer memory storage)
      if (Buffer.isBuffer(file)) {
        uploadStream.end(file);
      } else {
        // Nếu file từ fs.createReadStream
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
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file trên Cloudinary
 * @returns {Promise<Object>} - Phản hồi xóa từ Cloudinary
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
 * Lưu thông tin file đã tải lên vào cơ sở dữ liệu
 * @param {Object} fileData - Dữ liệu file bao gồm url, publicId, v.v.
 * @param {string} fileName - Tên file gốc
 * @param {string} purpose - Mục đích của file (ví dụ: DOCTOR_PROFILE)
 * @param {string} entityId - ID của thực thể liên quan (ví dụ: doctorId)
 * @param {string} uploadedBy - ID người dùng đã tải lên file
 * @returns {Promise<Object>} - Bản ghi Media đã tạo
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
    // Nếu có lỗi khi lưu vào cơ sở dữ liệu, xóa file từ Cloudinary
    if (fileData.publicId) {
      await deleteFromCloudinary(fileData.publicId);
    }
    throw new Error('Failed to save file information');
  }
};

/**
 * Tải lên hình ảnh cho bác sĩ
 * @param {File} file - File cần tải lên
 * @param {string} doctorId - ID bác sĩ
 * @param {string} userId - ID người dùng đang tải lên
 * @param {string} purpose - Mục đích của hình ảnh (profile hoặc gallery)
 * @returns {Promise<Object>} - Dữ liệu file đã tải lên
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
  
  // Cập nhật bác sĩ với URL hình ảnh mới nếu là hình ảnh profile
  if (purpose === 'DOCTOR_PROFILE') {
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { imageUrl: fileData.url },
    });
  } else if (purpose === 'DOCTOR_GALLERY') {
    // Thêm hình ảnh vào gallery của bác sĩ
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
 * Tải lên hình ảnh cho bệnh nhân
 * @param {File} file - File cần tải lên
 * @param {string} patientId - ID bệnh nhân
 * @param {string} userId - ID người dùng đang tải lên
 * @returns {Promise<Object>} - Dữ liệu file đã tải lên
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
  
  // Cập nhật bệnh nhân với URL hình ảnh mới
  await prisma.patient.update({
    where: { id: patientId },
    data: { profileImage: fileData.url },
  });
  
  return media;
};

/**
 * Tải lên hình ảnh cho đánh giá
 * @param {File[]} files - Các file cần tải lên
 * @param {string} reviewId - ID đánh giá
 * @param {string} userId - ID người dùng đang tải lên
 * @returns {Promise<Object[]>} - Dữ liệu các file đã tải lên
 */
const uploadReviewImages = async (files, reviewId, userId) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, 'reviews'));
  const fileDataArray = await Promise.all(uploadPromises);
  
  const imageUrls = fileDataArray.map(data => data.url);
  
  // Cập nhật đánh giá với URL hình ảnh
  await prisma.doctorReview.update({
    where: { id: reviewId },
    data: { images: imageUrls },
  });
  
  // Lưu chi tiết file vào cơ sở dữ liệu
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