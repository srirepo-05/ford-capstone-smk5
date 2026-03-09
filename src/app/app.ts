import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { ToastComponent } from './shared/components/toast/toast';

// Root shell component — renders the persistent layout (header, footer, toast)
// and the <router-outlet> which swaps in the current page component.
@Component({
  selector: 'app-root',       // matches <app-root> in index.html
  imports: [RouterOutlet, Header, Footer, ToastComponent],
  templateUrl: './app.html',
})
export class App {}
