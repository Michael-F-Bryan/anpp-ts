import { Packet } from ".";
import { calculateHeaderLRC, calculateCRC16 } from "./utils";

export const HeaderSize = 5;
export const MaxPacketSize = 255;
export const DecoderBufferSize = 8 * (MaxPacketSize + HeaderSize);

export type ChecksumFailedCallback = (e: ChecksumFailed) => void;

export interface ChecksumFailed {
    readonly id: number;
    readonly crc: number;
    readonly body: Uint8Array;
}

export default class Decoder {
    private buffer: Uint8Array = new Uint8Array(DecoderBufferSize);
    private bufferLength: number = 0;
    private checksumFailures: ChecksumFailedCallback[] = [];

    /**
     * How many more bytes can be added before the decoder's buffer is full?
     */
    public get remainingCapacity(): number {
        return this.buffer.length - this.bufferLength;
    }

    /**
     * Add data to the end of the decoder's buffer.
     * @param data The bytes to be appended.
     */
    public push(data: Uint8Array) {
        if (data.length > this.remainingCapacity) {
            throw new Error("Buffer overflow");
        }

        for (let i = 0; i < data.length; i++) {
            this.buffer[this.bufferLength + i] = data[i];
        }

        this.bufferLength += data.length;
    }

    /**
     * Try to decode a packet and remove it from the internal buffer.
     */
    public decode(): Packet | null {
        let decodeIterator = 0;
        let decoded: Packet | null = null;

        while (decodeIterator + HeaderSize <= this.bufferLength) {
            const lrc = this.buffer[decodeIterator++];
            const expectedLRC = calculateHeaderLRC(this.buffer.subarray(decodeIterator, decodeIterator + HeaderSize - 1));

            if (lrc == expectedLRC) {
                const id = this.buffer[decodeIterator++];
                const length = this.buffer[decodeIterator++];
                let crc = this.buffer[decodeIterator++];
                crc |= this.buffer[decodeIterator++] << 8;

                if (decodeIterator + length > this.bufferLength) {
                    // we've found a packet, but haven't received the entire
                    // body yet.
                    decodeIterator -= HeaderSize;
                    break;
                }

                const body = this.buffer.slice(decodeIterator, decodeIterator + length);
                const expectedCRC = calculateCRC16(body);

                if (crc == expectedCRC) {
                    decodeIterator += length;
                    decoded = new Packet(id, body);
                    break;
                } else {
                    this.onChecksumError(id, length, body);
                }
            }
        }

        if (decodeIterator < this.bufferLength) {
            if (decodeIterator > 0) {
                this.buffer.copyWithin(0, decodeIterator);
                this.bufferLength -= decodeIterator;
            }
        } else {
            this.bufferLength = 0;
        }

        return decoded;
    }

    public on(event: "crc-error", listener: ChecksumFailedCallback) {
        this.checksumFailures.push(listener);
    }

    public remove(event: "crc-error", listener: ChecksumFailedCallback) {
        const ix = this.checksumFailures.indexOf(listener);

        if (ix >= 0) {
            this.checksumFailures.splice(ix);
        }
    }

    private onChecksumError(id: number, crc: number, body: Uint8Array) {
        const ctx = { id, crc, body };
        this.checksumFailures.forEach(cb => cb(ctx));
    }
}

