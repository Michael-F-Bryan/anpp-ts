import { Decoder, Packet } from ".";
import { ChecksumFailed } from "./Decoder";

expect.extend({
    toEqualPacket: function (received, other) {
        return {
            pass: received instanceof Packet && other instanceof Packet && received.equals(other),
            message: "",
        };
    },
})

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualPacket(b: any): R;
        }
    }
}

describe("Decoder", function () {
    it("Can round-trip a packet", function () {
        const decoder = new Decoder();
        const packet = new Packet(42, "Hello, World!\n");

        decoder.pushPacket(packet);
        const got = decoder.decode();

        expect(got).toEqualPacket(packet);
    })

    it("Can detect a single-character message", function () {
        const decoder = new Decoder();
        const packet = new Packet(1, "!");

        decoder.pushPacket(packet);
        const got = decoder.decode();

        expect(got).toEqualPacket(packet);
    })

    it("Will remove the packet header when there's a checksum failure", function () {
        const decoder = new Decoder();
        const packet = new Packet(1, "!");
        const buffer = packet.encoded();
        buffer[buffer.length - 1] ^= 0x0f;
        decoder.push(buffer);
        const errors: ChecksumFailed[] = [];
        decoder.on("crc-error", e => errors.push(e));

        const got = decoder.decode();

        expect(got).toEqual(null);
        expect(errors).toHaveLength(1);
        expect(decoder.bufferLength).toEqual(1);
    })
})