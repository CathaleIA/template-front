import { UserInfo } from "@/types/user"
import { CognitoTokens } from "@/types/tokens";

export class AuthService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;

  /**
   * Obtiene los tokens de Cognito desde las cookies
   */
  static async getTokens(): Promise<CognitoTokens | null> {
    try {
      const response = await fetch('/api/auth/tokens', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }
      return await response.json();

    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Verifica si los tokens están expirados
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Refresca el access token usando el refresh token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return null;
      }

      // Verificar si el token está expirado
      if (this.isTokenExpired(tokens.expires_at)) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          return null;
        }
        // Obtener tokens actualizados
        const newTokens = await this.getTokens();
        if (!newTokens) {
          return null;
        }
        tokens.id_token = newTokens.id_token;
      }

      // Decodificar el ID token para obtener el username
      const payload = this.decodeJWT(tokens.id_token);
      const username = payload['cognito:username'] || payload.sub;

      const user = await this.getUserByUsername(username, tokens.id_token);

      if (user) {
        return user;
      }

      // Si falla la obtención del usuario, construimos un objeto básico con la info del token
      // Esto permite que el chat y otras funciones básicas sigan operando
      console.warn(`[AuthService] API returned null for user ${username}. Returning fallback user from token.`);
      return {
        userName: username,
        tenantId: payload['custom:tenant_id'] || 'unknown',
        userRole: payload['custom:role'] || 'TenantUser',
        email: payload.email || '',
        statusState: 'Active',
        isEnabled: true,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        tenantName: 'Unknown',
        tenantTier: 'Standard',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      // Even in catch, we might want to return something if we have tokens?
      // For now, let's keep it null if token retrieval fails entirely.
      return null;
    }
  }

  /**
   * Obtiene información de un usuario por username
   */
  static async getUserByUsername(username: string, token?: string): Promise<UserInfo | null> {
    try {
      if (!token) {
        const tokens = await this.getTokens();
        if (!tokens) {
          throw new Error('No token available');
        }
        token = tokens.id_token;
      }

      console.log(`[AuthService] Fetching user: ${username} | Using local API route: /api/user/${username}`);
      // Usamos la ruta local de Next.js para evitar problemas de CORS
      const response = await fetch(`/api/user/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = 'Could not parse error response';
        }
        console.error(`[AuthService] Error fetching user ${username}: Status ${response.status} | Details: ${errorDetails}`);

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();

      //Normalizamos los campos snake_case a camelCase
      const userInfo: UserInfo = {
        userName: data.user_name,
        tenantId: data.tenant_id,
        userRole: data.user_role,
        email: data.email,
        statusState: data.status,
        isEnabled: data.enabled,
        createdDate: data.created,
        modifiedDate: data.modified,
        tenantName: data.tenant_name,
        tenantTier: data.tenant_tier,
      };

      return userInfo;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Decodifica un JWT (solo para leer el payload, no para validar)
   */
  private static decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return {};
    }
  }

  /**
   * Cierra sesión eliminando las cookies
   */
  static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}