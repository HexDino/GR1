import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  upload, 
  uploadDoctorImage, 
  uploadPatientImage, 
  uploadReviewImages 
} from '@/services/upload';

// Function to parse form data with files
const parseMultipartFormData = async (request) => {
  const formData = await request.formData();
  const files = formData.getAll('files');
  const purpose = formData.get('purpose');
  const entityId = formData.get('entityId');
  
  return { files, purpose, entityId };
};

// POST /api/uploads - Handle file uploads
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse form data
    const { files, purpose, entityId } = await parseMultipartFormData(request);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (!purpose) {
      return NextResponse.json(
        { error: 'Purpose is required' },
        { status: 400 }
      );
    }
    
    if (!entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required' },
        { status: 400 }
      );
    }
    
    // Handle upload based on purpose
    let result;
    
    switch (purpose) {
      case 'DOCTOR_PROFILE':
        // Only allow one file for profile image
        result = await uploadDoctorImage(files[0], entityId, session.user.id, 'DOCTOR_PROFILE');
        break;
        
      case 'DOCTOR_GALLERY':
        // Allow multiple files for doctor gallery
        result = await Promise.all(
          files.map(file => uploadDoctorImage(file, entityId, session.user.id, 'DOCTOR_GALLERY'))
        );
        break;
        
      case 'PATIENT_PROFILE':
        // Only allow one file for profile image
        result = await uploadPatientImage(files[0], entityId, session.user.id);
        break;
        
      case 'REVIEW_IMAGE':
        // Allow multiple files for review images
        result = await uploadReviewImages(files, entityId, session.user.id);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid purpose' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload file(s)' },
      { status: 500 }
    );
  }
}

// GET /api/uploads - Get uploaded files for an entity
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const purpose = searchParams.get('purpose');
    
    if (!entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required' },
        { status: 400 }
      );
    }
    
    // Build query
    const where = { entityId };
    
    if (purpose) {
      where.purpose = purpose;
    }
    
    // Query the database for files
    const prisma = new PrismaClient();
    const files = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// DELETE /api/uploads - Delete an uploaded file
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Get the file details
    const prisma = new PrismaClient();
    const file = await prisma.media.findUnique({
      where: { id },
    });
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this file
    // Only allow file owner or admin to delete
    if (file.uploadedBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this file' },
        { status: 403 }
      );
    }
    
    // Delete from cloud storage if publicId exists
    if (file.publicId) {
      const { deleteFromCloudinary } = await import('@/services/upload');
      await deleteFromCloudinary(file.publicId);
    }
    
    // Delete from database
    await prisma.media.delete({
      where: { id },
    });
    
    // Update related entity if needed
    if (file.purpose === 'DOCTOR_PROFILE') {
      await prisma.doctor.update({
        where: { id: file.entityId },
        data: { imageUrl: null },
      });
    } else if (file.purpose === 'PATIENT_PROFILE') {
      await prisma.patient.update({
        where: { id: file.entityId },
        data: { profileImage: null },
      });
    } else if (file.purpose === 'DOCTOR_GALLERY') {
      // Remove URL from gallery array
      const doctor = await prisma.doctor.findUnique({
        where: { id: file.entityId },
        select: { galleryImages: true },
      });
      
      if (doctor && doctor.galleryImages) {
        const updatedGallery = doctor.galleryImages.filter(url => url !== file.url);
        await prisma.doctor.update({
          where: { id: file.entityId },
          data: { galleryImages: updatedGallery },
        });
      }
    } else if (file.purpose === 'REVIEW_IMAGE') {
      // Remove URL from review images array
      const review = await prisma.doctorReview.findUnique({
        where: { id: file.entityId },
        select: { images: true },
      });
      
      if (review && review.images) {
        const updatedImages = review.images.filter(url => url !== file.url);
        await prisma.doctorReview.update({
          where: { id: file.entityId },
          data: { images: updatedImages },
        });
      }
    }
    
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 