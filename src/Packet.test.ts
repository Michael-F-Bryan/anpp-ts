import { Packet } from ".";

describe("Packet", function () {
    it("Can encode Hello World", function () {
        const packet = new Packet(42, "Hello, World\n");

        const got = packet.encoded();

        const header = got.subarray(0, 5);
        expect(header).toEqual(new Uint8Array([4, 42, 13, 242, 211]));
        const body = got.subarray(5);
        expect(body).toEqual(new Uint8Array([72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 10]));
    })
})