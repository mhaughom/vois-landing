import { createCorsHandler } from '@li/shared/api/_cors';

export const { getCorsOrigin, setCorsHeaders } = createCorsHandler([
  'https://habos.ai',
  'https://www.habos.ai',
  'http://localhost:5173',
  'http://localhost:3000',
]);
