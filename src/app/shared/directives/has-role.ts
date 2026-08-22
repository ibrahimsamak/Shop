import { Directive, inject, input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { AuthStore } from '../../core/auth/auth-store';
import { Role } from '../../models/user';

@Directive({ selector: '[appHasRole]' })
export class HasRole {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthStore);
  appHasRole = input.required<Role[]>();
  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.auth.hasRole(...this.appHasRole())) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
