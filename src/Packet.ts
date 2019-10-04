import { HeaderSize, MaxPacketSize } from "./Decoder";
import { calculateCRC16, calculateHeaderLRC } from "./utils";

export default class Packet {
    public readonly id: number;
    public readonly body: Uint8Array;

    public constructor(id: number, body: Uint8Array | string) {
        const buffer = body instanceof Uint8Array ? body : new TextEncoder().encode(body);

        if (buffer.length > MaxPacketSize) {
            throw new Error(`The body can only be ${MaxPacketSize} bytes long but received ${body.length} bytes`);
        }

        this.id = id;
        this.body = buffer;
    }

    public get contentLength(): number {
        return this.body.length;
    }

    public get totalLength(): number {
        return this.contentLength + HeaderSize;
    }

    public writeTo(buffer: Uint8Array): number {
        const crc = calculateCRC16(this.body);
        buffer[1] = this.id;
        buffer[2] = this.contentLength;
        buffer[3] = crc & 0xff;
        buffer[4] = (crc >> 8) & 0xff;
        buffer[0] = calculateHeaderLRC(buffer.subarray(1, 5));

        buffer.set(this.body, 5);

        return this.totalLength;
    }

    public encoded(): Uint8Array {
        const buffer = new Uint8Array(this.totalLength);
        this.writeTo(buffer);
        return buffer;
    }
}