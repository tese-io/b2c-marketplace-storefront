'use server';

import { getAuthHeaders } from './cookies';
import { sdk } from '../config';

export type MatrixCredentials = {
  access_token: string;
  user_id: string;
  homeserver_url: string;
};

export type MatrixRoomResponse = {
  room_id: string;
  room_alias: string;
  customer_matrix_id: string;
  seller_matrix_id: string;
};

/**
 * Mint a Matrix session for the logged-in customer. The customer JWT lives
 * in a server-only cookie, so this must run as a server action; the
 * credentials are handed to the client-side Matrix provider.
 * Returns null when the visitor is not authenticated.
 */
export const getMatrixCredentials =
  async (): Promise<MatrixCredentials | null> => {
    const authHeaders = await getAuthHeaders();
    if (!('authorization' in authHeaders)) return null;

    return sdk.client
      .fetch<MatrixCredentials>('/store/matrix/token', {
        method: 'POST',
        headers: authHeaders,
        cache: 'no-store'
      })
      .catch(() => null);
  };

/**
 * Get-or-create the customer<->seller room for a product/order context
 * (replaces TalkJS getOrCreateConversation).
 */
export const ensureSellerChatRoom = async (input: {
  seller_id: string;
  context_id?: string;
  subject?: string;
}): Promise<MatrixRoomResponse | null> => {
  const authHeaders = await getAuthHeaders();
  if (!('authorization' in authHeaders)) return null;

  return sdk.client
    .fetch<MatrixRoomResponse>('/store/matrix/rooms', {
      method: 'POST',
      headers: authHeaders,
      body: input,
      cache: 'no-store'
    })
    .catch(() => null);
};
