import { supabase } from '@/lib/supabase';
import { failWithUserMessage } from '@/utils/errors';
import {
  SAVVY_IMAGES_BUCKET,
  contentTypeForExtension,
  extensionFromUri,
  isUploadableImageUri,
  storagePathFromPublicUrl,
} from '@/utils/imageUri';

export {
  SAVVY_IMAGES_BUCKET,
  isUploadableImageUri,
  isRemoteHttpUrl,
  extensionFromUri,
  contentTypeForExtension,
  storagePathFromPublicUrl,
} from '@/utils/imageUri';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user?.id;
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  return userId;
}

async function readUriBytes(uri: string): Promise<{ body: ArrayBuffer; contentType: string }> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const headerType = response.headers.get('content-type');
  const ext = extensionFromUri(uri);
  const contentType =
    headerType && headerType.startsWith('image/')
      ? headerType.split(';')[0]
      : contentTypeForExtension(ext);
  const body = await response.arrayBuffer();
  if (!body.byteLength) {
    throw new Error('A imagem está vazia.');
  }
  return { body, contentType };
}

export async function uploadLinkImage(localUri: string): Promise<string> {
  const userId = await requireUserId();
  const ext = extensionFromUri(localUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { body, contentType } = await readUriBytes(localUri);

  const { error } = await supabase.storage.from(SAVVY_IMAGES_BUCKET).upload(filePath, body, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw failWithUserMessage(error, 'Falha ao enviar a imagem.');
  }

  const { data } = supabase.storage.from(SAVVY_IMAGES_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Falha ao obter a URL pública da imagem.');
  }
  return data.publicUrl;
}

/** Upload local device URIs; pass through already-remote http(s) URLs. */
export async function ensureRemoteImageUrl(uri: string): Promise<string> {
  if (isUploadableImageUri(uri)) {
    return uploadLinkImage(uri);
  }
  return uri;
}

export async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = storagePathFromPublicUrl(url);
  if (!path) return;

  try {
    const userId = await requireUserId();
    if (!path.startsWith(`${userId}/`)) return;
    const { error } = await supabase.storage.from(SAVVY_IMAGES_BUCKET).remove([path]);
    if (error) {
      console.warn('Failed to delete stored image:', error);
    }
  } catch (error) {
    console.warn('Failed to delete stored image:', error);
  }
}

export async function deleteStoredImages(urls: Array<string | null | undefined>): Promise<void> {
  const unique = [...new Set(urls.filter((url): url is string => !!url))];
  await Promise.all(unique.map((url) => deleteStoredImage(url)));
}
