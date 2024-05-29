import express from 'express';

interface Options {
  port: number;
}

export class Server {
  private app = express();

  private port;

  constructor(options: Options) {
    const { port = 3000 } = options;

    this.port = port;
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`server running on port ${this.port}`);
    });
  }
}
