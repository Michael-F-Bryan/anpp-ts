import { Decoder, Packet } from ".";

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
})