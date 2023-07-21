import { Injectable } from '@nestjs/common';
import path, {join } from 'path';
@Injectable()
export class AppService {
  getHello(): string {
    return join(__dirname,'../../','client/dist/index.html')
  }
}
