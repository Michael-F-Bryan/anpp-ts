import { Packet } from ".";

describe("Packet", function () {
    it("Can encode Hello World", function () {
        const packet = new Packet(42, "Hello, World!\n");

        const got = packet.encoded();

        const header = got.subarray(0, 5);
        expect(header).toEqual(new Uint8Array([0x56, 0x2a, 0xe, 0xb, 0x67]));
        const body = got.subarray(5);
        expect(body).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x21, 0xa]));
    })
})