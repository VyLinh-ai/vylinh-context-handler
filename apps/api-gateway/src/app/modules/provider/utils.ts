import { QUICStream } from '@matrixai/quic';
import { HubMessage } from '../hub/hub.dto';

export async function readFrom(stream: QUICStream): Promise<HubMessage> {
  const collectedEncRes: Uint8Array[] = [];
  let readLen = 0;
  let totalReadLen: number = undefined;
  for await (const encRes of stream.readable) {
    if (!totalReadLen) {
      console.log(`read len ${encRes}`);
      totalReadLen = u8ArrayToNumber(encRes);
    } else {
      console.log(`read ${encRes}`);
      collectedEncRes.push(encRes);
      readLen += encRes.length;
      if (readLen == totalReadLen) {
        break;
      }
    }
  }

  const encRes = combineUint8Arrays(collectedEncRes);
  const decoder = new TextDecoder('utf-8');
  const jsonRes = decoder.decode(encRes);
  console.log(jsonRes);
  const res: HubMessage = JSON.parse(jsonRes);
  return res;
}

export async function writeTo(stream: QUICStream, msg: HubMessage) {
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const encReq = encoder.encode(JSON.stringify(msg));
  let writtenLen = 0;
  const totalWriteLen = encReq.length;
  // write the size of msg
  await writer.write(numberToU8Array(totalWriteLen));
  while (writtenLen < encReq.length) {
    const bz = encReq.subarray(writtenLen, writtenLen + 1000);
    await writer.write(encReq);
    writtenLen += 1000;
  }
}

export function combineUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  // Calculate the total length
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

  // Create a new Uint8Array with the total length
  const combinedArray = new Uint8Array(totalLength);

  // Keep track of the current index
  let offset = 0;

  // Copy each array into the combined array
  arrays.forEach((arr) => {
    combinedArray.set(arr, offset);
    offset += arr.length;
  });

  return combinedArray;
}

export function numberToU8Array(num): Uint8Array {
  if (num < 0 || num > 65535) {
    throw new RangeError('Number must be between 0 and 65535');
  }
  const highByte = (num >> 8) & 0xff;
  const lowByte = num & 0xff;
  return new Uint8Array([highByte, lowByte]);
}

export function u8ArrayToNumber(u8Array): number {
  if (u8Array.length !== 2) {
    throw new Error('Uint8Array must have exactly 2 elements');
  }

  const highByte = u8Array[0]; // Most significant byte
  const lowByte = u8Array[1]; // Least significant byte

  return (highByte << 8) | lowByte;
}
