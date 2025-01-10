/* eslint-disable no-useless-escape */
import axios from 'axios';
import {
  PINATA_FILE_TO_IPFS,
  PINATA_JSON_TO_IPFS,
} from '../constants/URL.constant';
import { DecodedUAToken } from './definitions/GlobalJWT.definition';
class OtherCommon {
  stringToSlug(title: string): string {
    let slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
      '',
    );
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, '');
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
  }
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
  async postPinata(formData: FormData) {
    try {
      const res = await axios.post(PINATA_FILE_TO_IPFS, formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data;`,
          pinata_api_key: process.env.API_KEY_PINATA,
          pinata_secret_api_key: process.env.API_SECRET_PINATA,
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error post Pinata:', error.response.data);
      throw error.response.data;
    }
  }

  uploadMetadataToIPFS = async (data: any) => {
    try {
      const res = await axios.post(PINATA_JSON_TO_IPFS, data, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: process.env.API_KEY_PINATA,
          pinata_secret_api_key: process.env.API_SECRET_PINATA,
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

  toFullNumberString(value: number | string): string {
    // Check if value is a number and within the safe integer range
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return value.toString();
    }

    // If it's a string, check if it is in scientific notation
    if (typeof value === 'string') {
      const parts = value.split('e');
      let base = parts[0];
      let exponent = parts.length > 1 ? Number(parts[1]) : 0;

      // Remove decimal point from the base for accurate length calculations
      const decimalIndex = base.indexOf('.');
      if (decimalIndex !== -1) {
        base = base.replace('.', ''); // Remove the decimal point
        exponent -= base.length - decimalIndex; // Adjust the exponent for the decimal point
      }

      // Construct the full number string
      const fullNumberString = base + '0'.repeat(exponent);
      return fullNumberString;
    }

    // Handle cases that do not meet criteria
    throw new Error(
      'Input must be a number or a string representing a number.',
    );
  }
}

export default new OtherCommon();
