import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    constructor(
        private reflector: Reflector,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const message =
            this.reflector.get<string>(
                RESPONSE_MESSAGE,
                context.getHandler(),
            ) ?? 'Success';

        return next.handle().pipe(
            map((data) => {

                /**
                 * Kalau service mengembalikan object pagination,
                 * jangan dibungkus lagi.
                 */

                if (data?.meta) {
                    return {
                        status: true,
                        message,
                        data: data.data,
                        meta: data.meta,
                    };
                }

                return {
                    status: true,
                    message,
                    data,
                };
            }),
        );
    }
}