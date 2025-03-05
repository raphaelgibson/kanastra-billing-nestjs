import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  async uploadFile() {
    return { message: 'Services running!' };
  }
}
