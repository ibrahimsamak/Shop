
import { inject } from "@angular/core";
import { AuthStore } from "./auth-store";
import { AuthApi } from "./auth-api";
import { firstValueFrom } from "rxjs";

export async function initSession(): Promise<void> {
  const auth = inject(AuthStore)
  const api = inject(AuthApi)
  const refresh = auth.refreshToken()
  if (!refresh) return;
  try {
    const { accessToken } = await firstValueFrom(api.refresh(refresh));
    auth.setAccessToken(accessToken);
    const user = await firstValueFrom(api.me());
    auth.setSession(accessToken, refresh, user.roles, user);
  } catch {
      auth.clear();
    }
  }
