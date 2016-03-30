import URLLocation from "./url_location";
import State from "./state";
import Socket from "../socket";
import SocketHooks from "./socket_hooks";
import HTTPRequest from "./http_request";
declare class HTTPSocket implements Socket {
    hooks: SocketHooks;
    session: string;
    location: URLLocation;
    readyState: State;
    stream: HTTPRequest;
    onopen: () => void;
    onerror: (error: any) => void;
    onclose: (closeEvent: any) => void;
    onmessage: (message: any) => void;
    onactivity: () => void;
    constructor(hooks: SocketHooks, url: string);
    send(payload: any): boolean;
    ping(): void;
    close(code: any, reason: any): void;
    sendRaw(payload: any): boolean;
    reconnect(): void;
    onClose(code: any, reason: any, wasClean: any): void;
    onChunk(chunk: any): void;
    onOpen(options: any): void;
    onEvent(event: any): void;
    onActivity(): void;
    onError(error: any): void;
    openStream(): void;
    closeStream(): void;
}
export default HTTPSocket;
