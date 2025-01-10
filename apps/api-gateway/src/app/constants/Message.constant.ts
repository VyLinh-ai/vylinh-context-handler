// import { EErrorCode } from './enums/Error.enum';

import OtherCommon from '../commons/Other.common';

const ERROR_SERVER = 'Something went wrong';
const QUEUE_CONNECTING = 'U2U queue connecting';
const QUEUE_CONNECTED = 'U2U queue connected';
const QUEUE_CONNECT_ERROR = 'U2U queue cannot connect';

const SERVER_MESSAGE = {
  REDIS_CONNECTING: 'Redis database connecting',
  REDIS_CONNECTED: 'Redis database connected',
  REDIS_SUBSCRIBER_CONNECTED: 'Redis subscriber connected',
};

const PARAMETER_ERROR = {
  EMAIL_EXISTS: {
    message: 'Email is exists!',
  },
  INVALID_PRICE: {
    message: 'Price is invalid!',
  },
  INVALID_BUNDLE: {
    message: 'Bundle is invalid!',
  },
  INVALID_BUNDLE_TYPE: {
    message: 'Bundle type is invalid!',
  },
};

export const LOGIN_MESSAGE = async (time: string) => {
  const config = await OtherCommon.fetchConfig(process.env.CONFIG_URL);
  return config['connectMessage'].replace('${time}', time) as string;
};
// `I want to login on UG at ${time}. I accept the U2U Terms of Service https://unicornultra.xyz and I am at least 13 years old.`;

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

export default {
  SERVER_MESSAGE,
  PARAMETER_ERROR,
  //   OTHER_ERROR,
  ERROR_SERVER,
  QUEUE_CONNECTED,
  QUEUE_CONNECTING,
  QUEUE_CONNECT_ERROR,
};
