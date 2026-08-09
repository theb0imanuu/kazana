import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<any>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<any>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          const hasItems = 'items' in data;
          const hasData = 'data' in data;
          const hasMeta = 'meta' in data;

          if ((hasItems || hasData) && hasMeta) {
            return {
              data: hasItems ? data.items : data.data,
              meta: data.meta || {},
            };
          }
        }

        return {
          data: data === undefined ? null : data,
          meta: {},
        };
      }),
    );
  }
}
