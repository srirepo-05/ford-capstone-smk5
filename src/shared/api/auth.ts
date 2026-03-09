import type { DummyJsonAuthResponse } from '../models/types';
import axios from 'axios';

// Dedicated axios instance for the DummyJSON API.
// Kept separate from the FakeStore http instance so baseURLs don't clash.
const dummyJsonHttp = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});

// POSTs credentials to the DummyJSON auth endpoint.
// Returns the full auth response (tokens + user profile) on success,
// or throws an AxiosError (4xx) when credentials are invalid.
export const loginWithDummyJson = async (
  username: string,
  password: string,
): Promise<DummyJsonAuthResponse> => {
  const response = await dummyJsonHttp.post<DummyJsonAuthResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  return response.data;
};
