import {Injectable} from "@angular/core";
import {HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {makeStateKey, TransferState} from "@angular/platform-browser";
import {tap} from "rxjs/operators";

@Injectable()
export class ServerStateInterceptor implements HttpInterceptor {
    constructor(private transferState: TransferState) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        return next.handle(req).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    this.transferState.set(makeStateKey(req.url), event.body);
                }
            })
        );
    }
}
