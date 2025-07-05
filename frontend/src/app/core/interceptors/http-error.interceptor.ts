import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, delayWhen, take } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar headers necessários
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return next.handle(modifiedReq).pipe(
      // Retry logic para erros de rede
      retryWhen(errors => 
        errors.pipe(
          delayWhen((error: HttpErrorResponse) => {
            // Retry apenas para erros de rede (0, 500, 502, 503, 504)
            if (this.shouldRetry(error)) {
              console.log(`Tentando novamente após erro: ${error.status}`);
              return timer(1000); // Aguarda 1 segundo antes de tentar novamente
            }
            return throwError(() => error);
          }),
          take(3) // Máximo 3 tentativas
        )
      ),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro desconhecido';
        
        if (error.error instanceof ErrorEvent) {
          // Erro do lado do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro do lado do servidor
          switch (error.status) {
            case 0:
              errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
              break;
            case 400:
              errorMessage = error.error?.message || 'Dados inválidos enviados.';
              break;
            case 401:
              errorMessage = 'Não autorizado. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Acesso negado.';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado.';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflito de dados.';
              break;
            case 422:
              errorMessage = this.extractValidationErrors(error.error);
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            case 502:
            case 503:
            case 504:
              errorMessage = 'Servidor temporariamente indisponível. Tente novamente.';
              break;
            default:
              errorMessage = `Erro ${error.status}: ${error.error?.message || error.message}`;
          }
        }

        console.error('Erro HTTP:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    // Retry apenas para erros de rede e erros temporários do servidor
    return error.status === 0 || 
           error.status === 500 || 
           error.status === 502 || 
           error.status === 503 || 
           error.status === 504;
  }

  private extractValidationErrors(errorResponse: any): string {
    if (errorResponse?.errors) {
      if (Array.isArray(errorResponse.errors)) {
        return errorResponse.errors.map((err: any) => err.message || err).join(', ');
      }
      if (typeof errorResponse.errors === 'object') {
        const messages: string[] = [];
        Object.keys(errorResponse.errors).forEach(key => {
          const fieldErrors = errorResponse.errors[key];
          if (Array.isArray(fieldErrors)) {
            messages.push(...fieldErrors);
          } else {
            messages.push(fieldErrors);
          }
        });
        return messages.join(', ');
      }
    }
    return errorResponse?.message || 'Dados inválidos.';
  }
}