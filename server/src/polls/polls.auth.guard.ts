import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthPayload, AuthRequest } from "src/utils/types";

@Injectable()
export class PollsAuthGuard implements CanActivate {
    private readonly logger = new Logger(PollsAuthGuard.name);
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest() ;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get('JWT_SECRET')
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['body'] = payload;
      this.logger.log(`UserID:${payload.sub} logged in Successfully`);
    } catch {
      throw new UnauthorizedException('InValid Authorization Token');
    }
    return true;
  }

  private extractTokenFromHeader(request: AuthRequest ): string | undefined {

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
