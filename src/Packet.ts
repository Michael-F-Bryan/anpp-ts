export default class Packet {
    public readonly id: number;
    public readonly body: Uint8Array;

    public constructor(id: number, body: Uint8Array) {
        this.id = id;
        this.body = body;
    }
}