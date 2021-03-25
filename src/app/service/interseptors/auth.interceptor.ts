import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{
  constructor(private cookieService: CookieService) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    // this.cookieService.set("1111111","111111111111");
    const token = this.cookieService.get('chatAccessToken');
    // const token = this.cookieService.get('1111111');

    console.log('TOKEN');
    console.log(token);

    if (token != null){
      authReq = req.clone({headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) } );
    }
    console.log(authReq);
    return next.handle(authReq);
  }
}
export const authInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
];
