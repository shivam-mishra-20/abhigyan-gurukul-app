declare module "socket.io-client" {
  export class Manager {
    constructor(url: string, opts?: any);
  }
  export class Socket {
    connected: boolean;
    id: string;
    on(event: string, callback: (...args: any[]) => void): this;
    off(event: string, callback?: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    connect(): void;
    disconnect(): void;
    close(): void;
    auth: { [key: string]: any };
    handshake: any;
  }
  export function io(url: string, opts?: any): Socket;
}
