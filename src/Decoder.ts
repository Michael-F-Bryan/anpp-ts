const HeaderSize = 5;
const MaxPacketSize = 255;
const DecoderBufferSize = 8 * (MaxPacketSize + HeaderSize);

export default class Decoder {
    private buffer: Uint8Array = new Uint8Array(DecoderBufferSize);
    private bufferLength: number = 0;

    public get remainingCapacity(): number {
        return this.buffer.length - this.bufferLength;
    }

    public push(data: Uint8Array) {
        if (data.length > this.remainingCapacity) {
            throw new Error("Buffer overflow");
        }

        for (let i = 0; i < data.length; i++) {
            this.buffer[this.bufferLength + i] = data[i];
        }

        this.bufferLength += data.length;
    }
}
