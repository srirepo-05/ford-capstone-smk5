import { Component } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';

// Thin wrapper — just injects the service and exposes it to the template.
// Placed once in app.html so it's always available regardless of the current route.
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html'
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
