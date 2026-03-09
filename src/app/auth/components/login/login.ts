import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink], // FormsModule enables ngModel + NgForm template-driven forms
  templateUrl: './login.html',
})
export class Login {
  // Signals drive the template reactively — no need to call detectChanges()
  loading = signal(false); // true while the HTTP request is in-flight; disables the submit button
  loginFailed = signal(false); // true after a failed attempt; shows the error banner

  constructor(
    public authService: AuthService,
    public router: Router,
  ) {}

  handleLogin(form: NgForm): void {
    if (form.invalid) return; // Angular template validation must pass first

    const { username, password } = form.value;
    this.loading.set(true);
    this.loginFailed.set(false);

    // subscribe() executes the Observable returned by login()
    // and receives the boolean result once the HTTP call completes
    this.authService.login(username, password).subscribe((success) => {
      this.loading.set(false);

      if (!success) {
        this.loginFailed.set(true);
        return;
      }

      this.router.navigate(['/admin/dashboard']);
    });
  }
}
