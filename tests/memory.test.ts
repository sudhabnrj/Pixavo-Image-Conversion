import assert from 'node:assert/strict';
import test from 'node:test';
import {
  disposeImageCollection,
  disposeImageResources,
  isObjectUrl,
  releaseCanvas,
  revokeObjectUrl,
} from '../src/utils/memory.ts';

test('isObjectUrl accepts only browser blob URLs', () => {
  assert.equal(isObjectUrl('blob:https://pixavo.app/123'), true);
  assert.equal(isObjectUrl('data:image/png;base64,abc'), false);
  assert.equal(isObjectUrl('https://pixavo.app/image.jpg'), false);
  assert.equal(isObjectUrl(undefined), false);
});

test('revokeObjectUrl ignores non-object URLs', () => {
  const revoked: string[] = [];
  const revoke = (url: string) => revoked.push(url);

  revokeObjectUrl('blob:https://pixavo.app/preview', revoke);
  revokeObjectUrl('https://pixavo.app/preview', revoke);
  revokeObjectUrl(undefined, revoke);

  assert.deepEqual(revoked, ['blob:https://pixavo.app/preview']);
});

test('disposeImageResources revokes preview and result URLs once', () => {
  const revoked: string[] = [];
  const sharedUrl = 'blob:https://pixavo.app/shared';

  disposeImageResources(
    { previewUrl: sharedUrl, resultUrl: sharedUrl },
    (url) => revoked.push(url),
  );

  assert.deepEqual(revoked, [sharedUrl]);
});

test('disposeImageCollection releases every owned object URL', () => {
  const revoked: string[] = [];

  disposeImageCollection(
    [
      { previewUrl: 'blob:preview-1', resultUrl: 'blob:result-1' },
      { previewUrl: 'data:image/jpeg;base64,abc', resultUrl: 'blob:result-2' },
    ],
    (url) => revoked.push(url),
  );

  assert.deepEqual(revoked, ['blob:preview-1', 'blob:result-1', 'blob:result-2']);
});

test('releaseCanvas resets its backing buffer dimensions', () => {
  const canvas = { width: 4096, height: 2160 };

  releaseCanvas(canvas);

  assert.deepEqual(canvas, { width: 0, height: 0 });
});
