import axios from 'axios';
import {
  PINATA_FILE_TO_IPFS,
  PINATA_JSON_TO_IPFS,
} from '../../constants/url.constant';
import { DecodedUAToken } from '../../definitions/GlobalJWT.definition';
export class Key {
  API_KEY: string;
  API_SECRET: string;
}
export class OtherCommon {
  getValueByOrder<T>(order: number, obj: T): T[keyof T] | undefined {
    // Convert the object values to an array
    const values = Object.values(obj);
    // Adjust for zero-based indexing
    const index = order;
    // Return the value at the specified index, or undefined if out of bounds
    return values[index];
  }
  async fetchConfig<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }
  async postPinata(formData: FormData, key: Key) {
    try {
      const res = await axios.post(PINATA_FILE_TO_IPFS, formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data;`,
          pinata_api_key: key.API_KEY,
          pinata_secret_api_key: key.API_SECRET,
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error post Pinata:', error.response.data);
      throw error.response.data;
    }
  }

  uploadMetadataToIPFS = async (data: any, key: Key) => {
    try {
      const res = await axios.post(PINATA_JSON_TO_IPFS, data, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: key.API_KEY,
          pinata_secret_api_key: key.API_SECRET,
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error.response.data);
    }
  };
  parseJwt(token: string): DecodedUAToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }
}
