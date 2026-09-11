import {
  contentTypeForExtension,
  extensionFromUri,
  isUploadableImageUri,
  storagePathFromPublicUrl,
} from '@/utils/imageUri';

describe('isUploadableImageUri', () => {
  it('detects device and web picker URIs', () => {
    expect(isUploadableImageUri('file:///var/photo.jpg')).toBe(true);
    expect(isUploadableImageUri('content://media/external/images/1')).toBe(true);
    expect(isUploadableImageUri('ph://asset-id')).toBe(true);
    expect(isUploadableImageUri('blob:https://localhost/abc')).toBe(true);
    expect(isUploadableImageUri('data:image/png;base64,aaa')).toBe(true);
    expect(isUploadableImageUri('https://cdn.example.com/a.jpg')).toBe(false);
    expect(isUploadableImageUri('')).toBe(false);
  });
});

describe('extensionFromUri', () => {
  it('reads extensions and data-URI mime types', () => {
    expect(extensionFromUri('file:///tmp/pic.PNG?query=1')).toBe('png');
    expect(extensionFromUri('data:image/webp;base64,aaa')).toBe('webp');
    expect(extensionFromUri('file:///tmp/noext')).toBe('jpg');
    expect(contentTypeForExtension('png')).toBe('image/png');
    expect(contentTypeForExtension('jpg')).toBe('image/jpeg');
  });
});

describe('storagePathFromPublicUrl', () => {
  it('extracts the object path from public and signed URLs', () => {
    expect(
      storagePathFromPublicUrl(
        'https://abc.supabase.co/storage/v1/object/public/savvy-images/user-1/pic.jpg'
      )
    ).toBe('user-1/pic.jpg');
    expect(
      storagePathFromPublicUrl(
        'https://abc.supabase.co/storage/v1/object/sign/savvy-images/user-1/pic.jpg?token=xyz'
      )
    ).toBe('user-1/pic.jpg');
    expect(storagePathFromPublicUrl('https://cdn.example.com/pic.jpg')).toBeNull();
  });
});
