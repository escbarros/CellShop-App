import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse, ResponseWithMeta, buildSuccessResponse } from '../http/api-response';
import { RequestWithId, readRequestId } from '../http/request-id';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T | ResponseWithMeta<T>,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ResponseWithMeta<T>>,
  ): Observable<ApiResponse<T>> {
    const requestId = readRequestId(context.switchToHttp().getRequest<RequestWithId>());

    return next.handle().pipe(map((payload) => buildSuccessResponse(payload, requestId)));
  }
}
