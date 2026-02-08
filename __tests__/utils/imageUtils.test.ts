// imageUtils 테스트
import '../../__tests__/setup';

// expo-image-manipulator Mock
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn((_uri: string, _actions: any[], options: any) =>
    Promise.resolve({ uri: `compressed_${_uri}`, width: 1200, height: 800 }),
  ),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}), { virtual: true });

// expo-image-picker Mock
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file:///test.jpg', width: 3000, height: 2000 }],
    }),
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file:///camera.jpg', width: 4000, height: 3000 }],
    }),
  ),
  MediaTypeOptions: { Images: 'Images' },
}));

// devicePermissions Mock
jest.mock('../../src/utils/devicePermissions', () => ({
  requestCameraPermission: jest.fn(() => Promise.resolve(true)),
  requestStoragePermission: jest.fn(() => Promise.resolve(true)),
}));

describe('imageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compressImage', () => {
    it('이미지를 압축하고 리사이징된 URI를 반환한다', async () => {
      const { compressImage } = require('../../src/utils/imageUtils');
      const result = await compressImage('file:///original.jpg', 1200, 0.7);
      expect(result).toBe('compressed_file:///original.jpg');
    });

    it('기본 파라미터로 동작한다', async () => {
      const { compressImage } = require('../../src/utils/imageUtils');
      const result = await compressImage('file:///photo.jpg');
      expect(result).toBe('compressed_file:///photo.jpg');
    });
  });

  describe('createThumbnail', () => {
    it('200px 썸네일을 생성한다', async () => {
      const { createThumbnail } = require('../../src/utils/imageUtils');
      const result = await createThumbnail('file:///photo.jpg');
      expect(result).toBe('compressed_file:///photo.jpg');
    });

    it('커스텀 크기로 생성한다', async () => {
      const { createThumbnail } = require('../../src/utils/imageUtils');
      const result = await createThumbnail('file:///photo.jpg', 100);
      expect(result).toBe('compressed_file:///photo.jpg');
    });
  });

  describe('pickImageFromGallery', () => {
    it('갤러리에서 이미지를 선택한다', async () => {
      const { pickImageFromGallery } = require('../../src/utils/imageUtils');
      const result = await pickImageFromGallery();
      expect(result).toBe('file:///test.jpg');
    });

    it('취소 시 null을 반환한다', async () => {
      const ImagePicker = require('expo-image-picker');
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });

      const { pickImageFromGallery } = require('../../src/utils/imageUtils');
      const result = await pickImageFromGallery();
      expect(result).toBeNull();
    });
  });

  describe('takePhoto', () => {
    it('카메라로 사진을 촬영한다', async () => {
      const { takePhoto } = require('../../src/utils/imageUtils');
      const result = await takePhoto();
      expect(result).toBe('file:///camera.jpg');
    });
  });

  describe('pickMultipleImages', () => {
    it('여러 이미지를 선택한다', async () => {
      const ImagePicker = require('expo-image-picker');
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file:///img1.jpg' },
          { uri: 'file:///img2.jpg' },
          { uri: 'file:///img3.jpg' },
        ],
      });

      const { pickMultipleImages } = require('../../src/utils/imageUtils');
      const result = await pickMultipleImages();
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('file:///img1.jpg');
    });

    it('취소 시 빈 배열을 반환한다', async () => {
      const ImagePicker = require('expo-image-picker');
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });

      const { pickMultipleImages } = require('../../src/utils/imageUtils');
      const result = await pickMultipleImages();
      expect(result).toHaveLength(0);
    });
  });
});
