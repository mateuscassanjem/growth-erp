import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestUser } from "./auth.types";

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<{ user: RequestUser; activeCompanyId?: string }>();
  return {
    ...request.user,
    tokenCompanyId: request.user.companyId,
    companyId: request.activeCompanyId ?? request.user.companyId
  };
});
