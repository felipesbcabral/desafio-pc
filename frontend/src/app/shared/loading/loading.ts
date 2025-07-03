import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class Loading {
  private loadingService = inject(LoadingService);
  
  isLoading$: Observable<boolean> = this.loadingService.isLoading$;
}
